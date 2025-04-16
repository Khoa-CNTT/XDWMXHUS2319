using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Message
{
    public class GetMessagesResponseDto
    {
        public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
        public int TotalCount { get; set; }
        public Guid? NextCursor { get; set; }
        public int PageSize { get; set; }
    }
}
