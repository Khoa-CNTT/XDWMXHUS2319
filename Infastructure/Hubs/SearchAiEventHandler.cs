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
    public class SearchAiEventHandler : INotificationHandler<SearchAIEvent>
    {
        private readonly INotificationService _notificationService;
        public SearchAiEventHandler(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        public async Task Handle(SearchAIEvent notification, CancellationToken cancellationToken)
        {
           // await _notificationService.SendMessageSearchAi(notification.UserId, notification.MessageUser, notification.MessageAI);
        }
    }
}
