namespace Application.CQRS.Commands.Messages
{
    public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, ResponseModel<MessageDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IChatService _chatService;
        private readonly IUserContextService _userContextService;
        private readonly IRedisService _redisService;
        private readonly INotificationService _notificationService;
        public SendMessageCommandHandler(
            IUnitOfWork unitOfWork,
            IChatService chatService,
            IUserContextService userContextService,
            IRedisService redisService,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _chatService = chatService;
            _userContextService = userContextService;
            _redisService = redisService;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel<MessageDto>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
        {
            var senderId = _userContextService.UserId();
            var user2Id = request.MessageDto.User2Id;

            // Kiểm tra nội dung tin nhắn
            if (string.IsNullOrWhiteSpace(request.MessageDto.Content))
            {
                return ResponseFactory.Fail<MessageDto>("Nội dung tin nhắn không được để trống.", 400);
            }

            // Tạo hoặc lấy conversation
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
                // Tạo MessageEvent với ID duy nhất
                var messageId = Guid.NewGuid();
                var messageEvent = new MessageEvent(
                    id: messageId,
                    conversationId: conversation.Id,
                    senderId: senderId,
                    receiverId: user2Id,
                    content: request.MessageDto.Content.Trim()
                );

                // Tạo MessageDto để trả về client
                var messageDto = new MessageDto
                {
                    Id = messageEvent.Id,
                    ConversationId = messageEvent.ConversationId,
                    SenderId = messageEvent.SenderId,
                    ReceiverId = messageEvent.ReceiverId,
                    Content = messageEvent.Content,
                    SentAt = FormatUtcToLocal(messageEvent.SentAt),
                    Status = MessageStatus.Sent.ToString(),
                    DeliveredAt = null,
                    SeenAt = null
                };

                // Kiểm tra xem tin nhắn đã tồn tại trong Redis chưa
                string queueKey = $"message_queue:{conversation.Id}";
                var existingEvents = await _redisService.GetListAsync<MessageEvent>(queueKey);
                if (existingEvents != null && existingEvents.Any(e => e.Id == messageId))
                {
                    return ResponseFactory.Fail<MessageDto>("Tin nhắn đã được xử lý.", 409);
                }

                // Đẩy tin nhắn vào Redis
                await _redisService.AddAsync(queueKey, messageEvent, TimeSpan.FromMinutes(30));
                await _redisService.AddToSetAsync("active_conversations", conversation.Id.ToString(), TimeSpan.FromMinutes(30));

                // Gửi tin nhắn qua SignalR
                await _chatService.SendMessageAsync(messageDto, user2Id);
                //viết nội dung thông báo message mới
                await _notificationService.SendNotificationNewMessageAsync(user2Id,$"{_userContextService.FullName()} đã nhắn tin cho bạn");
                // Log để theo dõi
                await _notificationService.SendNotificationMessageWithIsSeenFalse(conversation.Id, user2Id);

                return ResponseFactory.Success(messageDto, "Gửi tin nhắn thành công.", 200);
            }
            catch
            {
                return ResponseFactory.Fail<MessageDto>("Lỗi hệ thống khi gửi tin nhắn.", 500);
            }
        }
    }
}