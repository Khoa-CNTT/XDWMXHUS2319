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
        private readonly ISignalRNotificationService _signalRNotificationService;

        public ReplyCommentEventHandle(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(ReplyCommentEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendReplyNotificationSignalR(notification.PostId ,notification.CommentOwnerId, notification.ResponderId, notification.Message ?? "");
        }
    }
}
