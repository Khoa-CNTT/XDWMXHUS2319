using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.CommentLikes
{
    public class GetCommentLikeWithCursorResponse
    {
        public int LikeCount { get; set; } // ✅ Thêm LikeCount
        public List<UserPostDto> LikedUsers { get; set; } = new();
        public Guid? NextCursor { get; set; }
    }
}
