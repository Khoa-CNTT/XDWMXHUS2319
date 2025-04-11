using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Message
{
    public class GetConversationsResponseDto
    {
        public List<ConversationDto> Conversations { get; set; } = new List<ConversationDto>();
    }
}
