using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Notification
{
    public class GetNotificationResponse
    {
        public List<NotificationDto> Notifications { get; set; } = new();
        public DateTime? NextCursor { get; set; }
    }
}
