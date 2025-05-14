using Application.Model.Events;
using MediatR;


namespace Infrastructure.Hubs
{
    class AdminNotificationEventHandler : INotificationHandler<AdminNotificationEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;

        public AdminNotificationEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }
        public async Task Handle(AdminNotificationEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendAdminNotificationSignalR(notification);
        }
    }
}
