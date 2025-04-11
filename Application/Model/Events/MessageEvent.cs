using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class MessageEvent
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime SentAt { get; set; }
        public MessageStatus Status { get; set; }

        public MessageEvent(Guid id, Guid conversationId, Guid senderId, Guid receiverId, string content)
        {
            Id = id;
            ConversationId = conversationId;
            SenderId = senderId;
            ReceiverId = receiverId;
            Content = content;
            SentAt = DateTime.UtcNow;
            Status = MessageStatus.Sent;
        }
    }
}
