using Application.DTOs.Comments;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class OriginalPostDto
    {
        public Guid PostId { get; set; }
        public string Content { get; set; } = null!;

        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public UserPostDto Author { get; set; } = null!;
        public DateTime CreateAt { get; set; }

/*      public int CommentCount { get; set; }
        public List<CommentDto> Comments { get; set; } = new();

        public int LikeCount { get; set; }
        public List<UserPostDto> LikedUsers { get; set; } = new();

        public int ShareCount { get; set; }
        public List<UserPostDto> SharedUsers { get; set; } = new();*/
        public OriginalPostDto() { }
        public OriginalPostDto(Domain.Entities.Post post)
        {
            const string baseUrl = " https://localhost:7053";
            PostId = post.Id;
            Content = post.Content;
            ImageUrl = post.ImageUrl != null ? $"{baseUrl}{post.ImageUrl}" : null; // ✅ Thêm Base URL
            VideoUrl = post.VideoUrl != null ? $"{baseUrl}{post.VideoUrl}" : null; // ✅ Thêm Base URL

            CreateAt = post.CreatedAt;
            Author = new UserPostDto(post.User ?? new Domain.Entities.User("Người dùng ẩn danh", "anonymous@example.com", "hashed_password"));

/*            CommentCount = post.Comments?.Count(c => !c.IsDeleted) ?? 0;
            LikeCount = post.Likes?.Count ?? 0;
            ShareCount = post.Shares?.Count ?? 0;*/

       /*     // 🔥 Thêm danh sách chi tiết
            Comments = post.Comments?
                .Where(c => !c.IsDeleted)
                .Select(c => new CommentDto(c))
                .ToList() ?? new();

            LikedUsers = post.Likes?
                .Select(l => new UserPostDto(l.User))
                .ToList() ?? new();

            SharedUsers = post.Shares?
                .Select(s => new UserPostDto(s.User))
                .ToList() ?? new();*/
        }
    }
}
