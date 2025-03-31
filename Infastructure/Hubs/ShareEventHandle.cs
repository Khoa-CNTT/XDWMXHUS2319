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
    public class ShareEventHandle : INotificationHandler<ShareEvent>
    {
        private readonly INotificationService _notificationService;
        public ShareEventHandle(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        public async Task Handle(ShareEvent notification, CancellationToken cancellationToken)
        {
            await _notificationService.SendShareNotificationAsync(notification.PostId, notification.UserId);
        }

    }
}
