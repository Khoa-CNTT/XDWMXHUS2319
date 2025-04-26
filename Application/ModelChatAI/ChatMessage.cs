using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.ModelChatAI
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Query { get; set; }
        public string Answer { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
