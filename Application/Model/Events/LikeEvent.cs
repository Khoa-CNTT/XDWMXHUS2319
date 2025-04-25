using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class LikeEvent : INotification
    {
        public Guid OwnerId { get; set; }
        public ResponseNotificationModel Data { get; set; }
        public LikeEvent(Guid ownerId, ResponseNotificationModel data)
        {
            OwnerId = ownerId;
            Data = data;
        }
    }

}
