using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Comments
{
    public class GetRepliesResponse
    {
        public List<CommentDto> Replies { get; set; } = new();
        public Guid? LastReplyId { get; set; } // 🔥 ID của reply cuối cùng (dùng để load tiếp)
    }
}
