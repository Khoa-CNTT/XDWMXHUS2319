using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SendMessageNotificationEvent : INotification
    {
        public Guid ReceiverId { get; set; }
        public string Message { get; set; } = null!;
        public SendMessageNotificationEvent(Guid receiverId, string message)
        {

            ReceiverId = receiverId;
            Message = message;
        }
    }
}
