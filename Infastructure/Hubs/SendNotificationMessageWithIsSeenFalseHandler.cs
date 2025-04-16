using Application.Model.Events;
using MediatR;

namespace Infrastructure.Hubs
{
    public class SendNotificationMessageWithIsSeenFalseHandler : INotificationHandler<SendNotificationMessageWithIsSeenFalseEvent>
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        public SendNotificationMessageWithIsSeenFalseHandler(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task Handle(SendNotificationMessageWithIsSeenFalseEvent notification, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.User(notification.ReceiverId.ToString())
                .SendAsync("ReceiveUnreadCountNotification", notification.UnreadCount, cancellationToken);
        }
    }
}
