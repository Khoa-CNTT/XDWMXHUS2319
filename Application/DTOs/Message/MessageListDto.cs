using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Message
{
    public class MessageListDto
    {
        public List<MessageDto> Messages { get; set; } = new();
        public Guid? NextCursor { get; set; } // Nếu null => không còn tin nhắn nữa
    }

}
