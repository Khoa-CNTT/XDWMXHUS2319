
namespace Infrastructure.Service
{
    public class ChatService : IChatService
    {
        private readonly IHubContext<ChatHub> _chatHub;
        private readonly IUnitOfWork _unitOfWork;

        public ChatService(IHubContext<ChatHub> chatHub, IUnitOfWork unitOfWork)
        {
            _chatHub = chatHub;
            _unitOfWork = unitOfWork;
        }

        public async Task SendMessageAsync(MessageDto message, Guid recipientId)
        {
            // Cập nhật trạng thái "Delivered" khi gửi đến người nhận
            var dbMessage = await _unitOfWork.MessageRepository.GetByIdAsync(message.Id);
            if (dbMessage != null)
            {
                dbMessage.UpdateStatus(MessageStatus.Delivered);
                await _unitOfWork.SaveChangesAsync();
                message.Status = MessageStatus.Delivered;
                message.DeliveredAt = dbMessage.DeliveredAt;
            }

            // Gửi tin nhắn đến người nhận qua SignalR
            await _chatHub.Clients.User(recipientId.ToString()).SendAsync("ReceiveMessage", message);

            // Thông báo trạng thái "Delivered" cho người gửi
            await _chatHub.Clients.User(message.SenderId.ToString()).SendAsync("MessageDelivered", message.Id);
        }

        public async Task MarkMessageAsSeenAsync(Guid conversationId, Guid messageId)
        {
            var message = await _unitOfWork.MessageRepository.GetByIdAsync(messageId);
            if (message != null && message.Status != MessageStatus.Seen)
            {
                message.UpdateStatus(MessageStatus.Seen);
                message.UpdateSeenAt(DateTime.UtcNow);
                await _unitOfWork.SaveChangesAsync();
            }

            // Thông báo "Seen" cho tất cả trong cuộc trò chuyện
            await _chatHub.Clients.Group(conversationId.ToString())
                       .SendAsync("MessageSeen", messageId);
        }
    }
}
