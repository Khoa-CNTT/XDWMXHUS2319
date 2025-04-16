using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Message
{
    public class MessageCreateDto
    {
        public Guid User2Id { get; set; }  // Recipient ID
        public string Content { get; set; } = string.Empty;
    }
}
