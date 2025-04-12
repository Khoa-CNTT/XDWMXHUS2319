using static Domain.Common.Helper;
using Application.CQRS.Commands.Messages;
using Application.DTOs.Message;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;


namespace Application.Services
{
    public class MessageService : IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatService _chatService;
        private readonly IUserRepository _userRepository; // Assuming this exists
        private readonly IUserContextService _userContextService;
        public MessageService(
            IUnitOfWork unitOfWork,
            IChatService chatService,
            IUserRepository userRepository,
            IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _chatService = chatService;
            _userRepository = userRepository;
            _userContextService = userContextService;
        }



        public async Task<List<ConversationDto>> GetConversationsAsync()
        {
            var userId = _userContextService.UserId();
            var conversations = await _unitOfWork.ConversationRepository
                .GetAllConversationsAsync(userId);

            if (conversations == null || !conversations.Any())
            {
                return new List<ConversationDto>(); // Trả về danh sách rỗng nếu không có cuộc trò chuyện
            }

            // Lấy tất cả conversation IDs
            var conversationIds = conversations.Select(c => c.Id).ToList();

            // Tối ưu: Lấy tin nhắn cuối cùng và số tin nhắn chưa đọc trong một truy vấn
            var lastMessagesTask = _unitOfWork.MessageRepository.GetLastMessagesByConversationIdsAsync(conversationIds);
            var unreadCountsTask = _unitOfWork.MessageRepository.GetUnreadCountsByConversationIdsAsync(conversationIds, userId);
            var otherUserIds = conversations.Select(c => c.User1Id == userId ? c.User2Id : c.User1Id).Distinct().ToList();
            var otherUsersTask = _userRepository.GetUsersByIdsAsync(otherUserIds);

            // Chờ tất cả các tác vụ hoàn thành
            await Task.WhenAll(lastMessagesTask, unreadCountsTask, otherUsersTask);

            var lastMessages = lastMessagesTask.Result;
            var unreadCounts = unreadCountsTask.Result;
            var otherUsers = otherUsersTask.Result.ToDictionary(u => u.Id);

            var conversationDtos = conversations.Select(conv =>
            {
                var otherUserId = conv.User1Id == userId ? conv.User2Id : conv.User1Id;
                var lastMessage = lastMessages.FirstOrDefault(m => m.ConversationId == conv.Id);

                return new ConversationDto
                {
                    Id = conv.Id,
                    OtherUserId = otherUserId,
                    OtherUserName = otherUsers.ContainsKey(otherUserId) ? otherUsers[otherUserId].FullName : "Unknown User",
                    CreatedAt = conv.CreatedAt,
                    LastMessage = lastMessage != null ? new MessageDto
                    {
                        Id = lastMessage.Id,
                        ConversationId = lastMessage.ConversationId,
                        SenderId = lastMessage.SenderId,
                        Content = lastMessage.Content,
                        SentAt = FormatUtcToLocal(lastMessage.SentAt),
                        IsSeen = lastMessage.IsSeen,
                        SeenAt = lastMessage.SeenAt.HasValue ? FormatUtcToLocal(lastMessage.SeenAt.Value) : null
                    } : null,
                    UnreadCount = unreadCounts.ContainsKey(conv.Id) ? unreadCounts[conv.Id] : 0
                };
            }).OrderByDescending(c =>
                c.LastMessage != null
                    ? DateTime.Parse(c.LastMessage.SentAt ?? FormatUtcToLocal(DateTime.UtcNow))
                    : c.CreatedAt
                ).ToList();


            return conversationDtos;
        }

        public async Task<MessageListDto> GetMessagesAsync(Guid conversationId,Guid userId,Guid? lastMessageId = null,int pageSize = 10)
        {
            var messages = await _unitOfWork.MessageRepository
                .GetMessagesByConversationAsync(conversationId, 1, pageSize, lastMessageId);

            var messageDtos = messages.Select(m => new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                Content = m.Content,
                SentAt =FormatUtcToLocal( m.SentAt),
                IsSeen = m.IsSeen,
                SeenAt =FormatUtcToLocal( m.SeenAt ?? DateTime.UtcNow),
            }).ToList();

            var nextCursor = messageDtos.Count() == pageSize
                ? messageDtos.Last().Id
                : (Guid?)null;

            return new MessageListDto { Messages = messageDtos, NextCursor = nextCursor };

        }



        public async Task<ResponseModel<string>> MarkMessageAsSeenAsync(Guid messageId)
        {
            var userId = _userContextService.UserId();
            var message = await _unitOfWork.MessageRepository.GetByIdAsync(messageId);

            if (message == null)
            {
                return ResponseFactory.Fail<string>("Tin nhắn không tồn tại.", 404);
            }

            var conversation = await _unitOfWork.ConversationRepository.GetByIdAsync(message.ConversationId);
            if (conversation == null)
            {
                return ResponseFactory.Fail<string>("Cuộc trò chuyện không tồn tại.", 404);
            }
            if (conversation.User1Id != userId && conversation.User2Id != userId)
            {
                return ResponseFactory.Fail<string>("Bạn không có quyền đánh dấu tin nhắn này.", 403);
            }

            message.CheckIsSeen(true);
            await _unitOfWork.MessageRepository.UpdateAsync(message);
            await _unitOfWork.SaveChangesAsync();

            return ResponseFactory.Success("Tin nhắn đã được đánh dấu là đã đọc.", "Thành công.", 200);
        }

    }
}
