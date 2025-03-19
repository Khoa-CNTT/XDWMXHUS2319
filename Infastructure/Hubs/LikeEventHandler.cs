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
        private readonly INotificationService _notificationService;

        public LikeEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(LikeEvent notification, CancellationToken cancellationToken)
        {
            await _notificationService.SendLikeNotificationAsync(notification.PostId, notification.UserId);
        }
    }
}
