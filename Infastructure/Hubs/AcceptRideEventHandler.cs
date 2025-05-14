using Application.Model.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class AcceptRideEventHandler : INotificationHandler<AcceptRideEvent>
    {

        private readonly IHubContext<NotificationHub> _hubContext;

        public AcceptRideEventHandler(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Handle(AcceptRideEvent notification, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.User(notification.PassengerId.ToString())
                    .SendAsync("ReceiveAcceptRide", notification.Data);
        }
    }
}
