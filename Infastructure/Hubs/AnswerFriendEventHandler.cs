using Application.Model.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class AnswerFriendEventHandler : INotificationHandler<AnswerFriendEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;

        public AnswerFriendEventHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(AnswerFriendEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendAnswerFriendNotificationSignalR(notification.FriendId, notification.Data);
        }
    }
}
