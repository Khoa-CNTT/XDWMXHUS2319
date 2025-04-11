using Application.Model.Events;
using MediatR;
using System;
using Application.Interface.Hubs;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class SendFriendEventHandler : INotificationHandler<SendFriendEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;

        public SendFriendEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(SendFriendEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendFriendNotificationSignalR(notification.FriendId, notification.Data);
        }
    }
}
