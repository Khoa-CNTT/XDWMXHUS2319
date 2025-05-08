using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Notifications
{
    public class MarkNotificationAsReadCommand : IRequest<ResponseModel<bool>>
    {
        public Guid NotificationId { get; set; }
    }
}
