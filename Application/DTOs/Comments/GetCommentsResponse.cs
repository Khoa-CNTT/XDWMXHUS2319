using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Comments
{
    public class GetCommentsResponse
    {
            public List<CommentDto> Comments { get; set; } = new();
            public Guid? LastCommentId { get; set; } // ID của bình luận cuối

    }
}
