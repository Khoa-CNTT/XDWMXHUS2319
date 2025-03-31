using Application.Interface.Hubs;
using Application.Model.Events;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class CommentEventHandler : INotificationHandler<CommentEvent>
    {
        private readonly INotificationService _notificationService;

        public CommentEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Handle(CommentEvent notification, CancellationToken cancellationToken)
        {
            await _notificationService.SendCommentNotificationAsync(notification.PostId, notification.CommenterId, notification.CommenterName);
        }
    }
}
