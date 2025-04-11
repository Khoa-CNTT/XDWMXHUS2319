using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class ReplyCommentEvent : INotification
    {
        public Guid ReceiverId { get; }
        public ResponseNotificationModel Data { get; }

        public ReplyCommentEvent(Guid receiverId, ResponseNotificationModel data)
        {
            ReceiverId = receiverId;
            Data = data;
        }
    }
}
