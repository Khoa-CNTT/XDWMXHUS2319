using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ChatAI
{
    public class AIConversationDto
    {
        public Guid ConversationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public List<AIChatHistoryDto> Messages { get; set; } = new();
    }
}
