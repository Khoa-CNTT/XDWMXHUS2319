using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Message
{
    public class ConversationDto
    {
        public Guid Id { get; set; }
        public Guid OtherUserId { get; set; }
        public string OtherUserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public MessageDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }
}
