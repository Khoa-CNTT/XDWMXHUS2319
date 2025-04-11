using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class SendMessageNotificationEvent : INotification
    {
        public Guid MessageId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Message { get; set; } = null!;
        public SendMessageNotificationEvent(Guid mesageId,Guid senderId,Guid receiverId, string message)
        {
            MessageId = mesageId;
            SenderId = senderId;
            ReceiverId = receiverId;
            Message = message;
        }
    }
}
