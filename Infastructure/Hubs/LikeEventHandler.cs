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
    public class LikeEventHandler : INotificationHandler<LikeEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;

        public LikeEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(LikeEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendLikeNotificationSiganlR(notification.OwnerId, notification.Data);
        }
    }
}
