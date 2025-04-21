using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class ShareEvent : INotification
    {
        public Guid UserId { get; set; }
        public ResponseNotificationModel Data { get; set; }

        public ShareEvent(Guid userId, ResponseNotificationModel data)
        {
            UserId = userId;
            Data = data;
        }  
    }
}
