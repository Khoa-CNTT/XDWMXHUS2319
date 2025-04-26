using Application.Model.Events;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Pipelines.Sockets.Unofficial.Buffers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Infrastructure.Hubs
{
    public class LikeCommentEventHandler : INotificationHandler<LikeCommentEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public LikeCommentEventHandler(ISignalRNotificationService signalRNotificationService, IHubContext<NotificationHub> hubContext)
        {
            _signalRNotificationService = signalRNotificationService;
            _hubContext = hubContext;
        }

        public async Task Handle(LikeCommentEvent notification, CancellationToken cancellationToken)
        {
            await _hubContext.Clients.User(notification.ReceivedId.ToString())
                    .SendAsync("ReceiveLikeCommentNotification", notification.Data);
        }
    }
}
