using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mapping
{
    public static class PostMapping
    {
        public static PostDto MaptoPostDto(Post post)
        {
            return new PostDto
            {
                Id = post.Id,
                Content = post.Content,
                FullName = post.User?.FullName ?? "Unknown",  // Tên người đăng bài
                ImageUrl = post.ImageUrl,  // Ảnh đính kèm
                VideoUrl = post.VideoUrl,  // Video đính kèm
                CreatedAt = post.CreatedAt,

                // Đếm số lượt bình luận
                CommentCount = post.Comments?.Count ?? 0,
                Comments = post.Comments?.Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "Unknown",
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList() ?? new List<CommentDto>(),

                // Đếm số lượt thích
                LikeCount = post.Likes?.Count ?? 0,
                LikedUsers = post.Likes?.Select(l => new LikeDto
                {
                    UserId = l.UserId,
                    UserName = l.User?.FullName ?? "Unknown"
                }).ToList() ?? new List<LikeDto>(),

                // Đếm số lượt chia sẻ
                ShareCount = post.Shares?.Count ?? 0,
                SharedUsers = post.Shares?.Select(s => new ShareDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.FullName ?? "Unknown",
                    SharedAt = s.CreatedAt
                }).ToList() ?? new List<ShareDto>()
            };
        }
    }
}
