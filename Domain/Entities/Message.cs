using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Message
    {
        public Guid Id { get; private set; }

        public Guid ConversationId { get; private set; }
        public Guid SenderId { get; private set; }

        public string Content { get; private set; } = string.Empty;
        public DateTime SentAt { get; private set; } = DateTime.UtcNow;

        public bool IsSeen { get; private set; } = false;
        public DateTime? SeenAt { get; private set; }
        public MessageStatus Status { get; private set; } = MessageStatus.Sent;
        public DateTime? DeliveredAt { get; private set; }

        // Navigation
        // Navigation properties
        public Conversation Conversation { get; set; } = default!;
        public User Sender { get; set; } = default!;
        public Message(Guid conversationId, Guid senderId, string content)
        {
            ConversationId = conversationId;
            SenderId = senderId;
            Content = content;
        }
        public void CheckIsSeen(bool isSeen)
        {
            IsSeen = isSeen;
            if (isSeen)
            {
                SeenAt = DateTime.UtcNow;
            }
        }
       public void UpdateStatus(MessageStatus status)
        {
            Status = status;
        }
        public void UpdateContent(string content)
        {
            Content = content;
        }
        public void UpdateSeenAt(DateTime? seenAt)
        {
            SeenAt = seenAt;
            IsSeen = true;
        }
        public void UpdateSentAt(DateTime sentAt)
        {
            SentAt = sentAt;
        }
    }

}

