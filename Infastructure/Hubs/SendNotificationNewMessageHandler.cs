using Application.Model.Events;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class SendNotificationNewMessageHandler : INotificationHandler<SendMessageNotificationEvent>
    {
        private readonly ISignalRNotificationService _signalRNotificationService;
        public SendNotificationNewMessageHandler(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }
        public async Task Handle(SendMessageNotificationEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendNewMessageSignalRAsync(notification);
        }
    }

}
