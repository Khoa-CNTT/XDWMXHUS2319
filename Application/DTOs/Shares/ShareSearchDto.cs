using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Shares
{
    public class ShareSearchDto
    {
        public Guid ShareId { get; set; }
        public string? Content { get; set; }
        public DateTime SharedAt { get; set; }
/*        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public int ShareCount { get; set; }*/
        public AuthorDto? User { get; set; }
        public OriginalPostDto? OriginalPost { get; set; }  // Bài viết gốc nếu có
    }
}
