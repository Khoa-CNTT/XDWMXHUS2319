using Application.Interface.Hubs;
using Application.Model.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class UpdateLocationEventHandler : INotificationHandler<UpdateLocationEvent>
    {
       private readonly ISignalRNotificationService _signalRNotificationService;
        public UpdateLocationEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }
        public async Task Handle(UpdateLocationEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendNotificationUpdateLocationSignalR(notification.DriverId, notification.PassengerId, notification.Messsage ?? "");
        }
    }
}
