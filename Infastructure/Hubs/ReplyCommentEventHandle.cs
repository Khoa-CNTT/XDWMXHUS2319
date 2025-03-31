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
    public class ReplyCommentEventHandle : INotificationHandler<ReplyCommentEvent>
    {
        private readonly INotificationService _notificationService;

        public ReplyCommentEventHandle(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }


        public async Task Handle(ReplyCommentEvent notification, CancellationToken cancellationToken)
        {
            await _notificationService.SendReplyNotificationAsync(notification.CommentId, notification.ResponderId, notification.ResponderName);
        }
    }
}
