using static Domain.Common.Helper;
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
                message.Status = MessageStatus.Delivered.ToString();
                message.DeliveredAt =FormatUtcToLocal( DateTime.UtcNow);
            }

            // Gửi tin nhắn đến người nhận qua SignalR
            // Gửi tin nhắn đến cả người nhận và người gửi qua cùng sự kiện ReceiveMessage
            await _chatHub.Clients.Users(new[] { recipientId.ToString(), message.SenderId.ToString() })
                .SendAsync("ReceiveMessage", message);
            // Thông báo trạng thái "Delivered" cho người gửi
            await _chatHub.Clients.User(message.SenderId.ToString()).SendAsync("MessageDelivered", message.Id);
            await _chatHub.Clients.User(message.ReceiverId.ToString()).SendAsync("MessageNotifyData", message);
        }
    }
}
