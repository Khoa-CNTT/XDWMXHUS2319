using Application.DTOs.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetReadNotificationsQuery : IRequest<ResponseModel<GetNotificationResponse>>
    {
        public DateTime? Cursor { get; set; }
        public int PageSize { get; set; } = 5;
    }
}
