using Application.Interface.Hubs;
using Application.Model.Events;
using MediatR;


namespace Infrastructure.Hubs
{
    public class AlertEventHandler : INotificationHandler<SendInAppNotificationEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;
        public AlertEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(SendInAppNotificationEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendAlertSignalR(notification.userId, notification.message);
        }
    }
}
