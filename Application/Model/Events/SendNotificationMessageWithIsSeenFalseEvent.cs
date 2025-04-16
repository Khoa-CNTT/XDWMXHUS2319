using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SendNotificationMessageWithIsSeenFalseEvent : INotification
    {
        public Guid ReceiverId { get; set; }
        public int UnreadCount { get; set; }
        public SendNotificationMessageWithIsSeenFalseEvent(Guid receiverId, int unreadCount)
        {
            ReceiverId = receiverId;
            UnreadCount = unreadCount;
        }
    }
}
