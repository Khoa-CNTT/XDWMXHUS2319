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
            // Gửi thông báo đến tài xế
            if (notification.DriverId != Guid.Empty)
            {
                await _signalRNotificationService.SendNotificationUpdateLocationSignalR(
                    notification.DriverId,
                    Guid.Empty,
                    notification.Message
                );
            }

            // Gửi thông báo đến hành khách nếu có
            if (notification.PassengerId.HasValue && notification.PassengerId.Value != Guid.Empty)
            {
                await _signalRNotificationService.SendNotificationUpdateLocationSignalR(
                    notification.PassengerId.Value,
                    Guid.Empty,
                    notification.Message
                );
            }
        }
    }
}
