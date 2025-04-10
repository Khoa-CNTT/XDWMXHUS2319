using Application.DTOs.Message;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.Messages
{
    public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ResponseModel<MessageDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatService _chatService;
        private readonly IUserContextService _userContextService;

        public SendMessageCommandHandler(
            IUnitOfWork unitOfWork,
            IChatService chatService,
            IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _chatService = chatService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<MessageDto>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
        {
            var senderId = _userContextService.UserId();
            var user2Id = request.MessageDto.User2Id;
            var (minId, maxId) = senderId.CompareTo(user2Id) < 0 ? (senderId, user2Id) : (user2Id, senderId);

            var conversation = await _unitOfWork.ConversationRepository.GetConversationAsync(senderId, user2Id);
            if (conversation == null)
            {
                conversation = new Conversation(minId, maxId);
                await _unitOfWork.ConversationRepository.AddAsync(conversation);
                await _unitOfWork.SaveChangesAsync();
            }

            try
            {
                var message = new Message(conversation.Id, senderId, request.MessageDto.Content);
                await _unitOfWork.MessageRepository.AddAsync(message);
                await _unitOfWork.SaveChangesAsync();

                var messageDto = new MessageDto
                {
                    Id = message.Id,
                    ConversationId = message.ConversationId,
                    SenderId = message.SenderId,
                    Content = message.Content,
                    SentAt =FormatUtcToLocal( message.SentAt),
                    Status = message.Status,
                    DeliveredAt = message.DeliveredAt,
                    SeenAt =FormatUtcToLocal( message.SeenAt ?? DateTime.UtcNow)
                };

                await _chatService.SendMessageAsync(messageDto, request.MessageDto.User2Id);

                return ResponseFactory.Success(messageDto, "Gửi tin nhắn thành công.", 200);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<MessageDto>(ex.Message, 500);
            }
        }
    }
}
