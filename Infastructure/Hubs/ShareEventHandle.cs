using Application.Interface.Hubs;
using Application.Model.Events;
using Infrastructure.Service;
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
        private readonly ISignalRNotificationService _signalRNotificationService;
        public ShareEventHandle(ISignalRNotificationService signalRNotificationService)
        {
            _signalRNotificationService = signalRNotificationService;
        }

        public async Task Handle(ShareEvent notification, CancellationToken cancellationToken)
        {
            await _signalRNotificationService.SendShareNotificationAsync(notification.UserId,notification.Data);
        }
    }
}
