using Application.DTOs.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetNotificationsByTypeQuery : IRequest<ResponseModel<GetNotificationResponse>>
    {
        public int Type { get; set; }
        public DateTime? Cursor { get; set; }
        public int PageSize { get; set; } = 10;

    }
}
