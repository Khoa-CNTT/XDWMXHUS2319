using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Message
    {
        public Guid Id { get; private set; }
        public Guid SenderId { get; private set; }
        public Guid ReceiverId { get; private set; }
        public string Content { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsRead { get; private set; }

        public Message(Guid senderId, Guid receiverId, string content)
        {
            if (senderId == Guid.Empty) throw new ArgumentException("SenderId cannot be empty.");
            if (receiverId == Guid.Empty) throw new ArgumentException("ReceiverId cannot be empty.");
            if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content cannot be empty.");

            Id = Guid.NewGuid();
            SenderId = senderId;
            ReceiverId = receiverId;
            Content = content;
            CreatedAt = DateTime.UtcNow;
            IsRead = false;
        }

        /// <summary>
        /// Đánh dấu tin nhắn là đã đọc
        /// </summary>
        public void MarkAsRead()
        {
            IsRead = true;
        }
    }
}

