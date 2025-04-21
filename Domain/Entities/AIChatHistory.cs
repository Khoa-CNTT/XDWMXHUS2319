using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class AIChatHistory
    {
        public Guid Id { get;private set; }
        public Guid ConversationId { get; private set; }
        public string Query { get; private set; }
        public string Answer { get; private set; }
        public int TokenCount { get; private set; }
        public DateTime Timestamp { get; private set; }
        public AIConversation AIConversation { get; private set; } = default!; // Navigation property to AIConversation entity

        public AIChatHistory(Guid conversationId, string query, string answer, int tokenCount)
        {
            Id = Guid.NewGuid();
            ConversationId = conversationId;
            Query = query;
            Answer = answer;
            TokenCount = tokenCount;
            Timestamp = DateTime.UtcNow;
        }
    }
}
