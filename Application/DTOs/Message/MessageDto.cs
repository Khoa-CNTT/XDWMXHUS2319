using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Message
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? SentAt { get; set; }
        public bool IsSeen { get; set; }
        public string? SeenAt { get; set; }
        public string? DeliveredAt { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? Status { get; set; }
    }
}
