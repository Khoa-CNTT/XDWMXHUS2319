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
        public string Context { get; private set; } = string.Empty;
        public string Type { get; private set; } = string.Empty;
        public DateTime Timestamp { get; private set; }
        public AIConversation AIConversation { get; private set; } = default!; // Navigation property to AIConversation entity

        public AIChatHistory(Guid conversationId, string query, string answer, int tokenCount,string context,string type)
        {
            Id = Guid.NewGuid();
            ConversationId = conversationId;
            Query = query;
            Answer = answer;
            TokenCount = tokenCount;
            Context = context;
            Type = type;
            Timestamp = DateTime.UtcNow;
        }
        public void UpdateAnswer(string answer)
        {
            Answer = answer;
            Timestamp = DateTime.UtcNow;
        }
    }
}
