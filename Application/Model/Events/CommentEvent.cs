using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class CommentEvent : INotification
    {
        public Guid PostOwnerId { get; }
        public ResponseNotificationModel Data { get; }

        public CommentEvent(Guid postOwnerId, ResponseNotificationModel data)
        {
            PostOwnerId = postOwnerId;
            Data = data;
        }
    }
}
