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
        private readonly ISignalRNotificationService _signalRNotificationService;

        public CommentEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }


        public async Task Handle(CommentEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendCommentNotificationSignalR(notification.PostOwnerId, notification.Data);
        }
    }
}
