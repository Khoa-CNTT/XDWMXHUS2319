using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ChatAI
{
    public class AIConversationResponseDto
    {
        public List<AIConversationDto> Conversations { get; set; } = new();
        public Guid? NextCursor { get; set; } = null;
    }
}
