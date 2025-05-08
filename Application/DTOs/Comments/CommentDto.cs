using Application.DTOs.CommentLikes;
using Application.DTOs.Post;
using Domain.Entities;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Comments
{
    public class CommentDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int HasLiked { get; set; }
        /*        public CommentLikeDto CommentLikes { get; set; } = new CommentLikeDto();*/
        public int LikeCountComment { get; set; }

        public List<CommentDto> Replies { get; set; } = new(); // Danh sách comment con (reply)
        public bool HasMoreReplies { get; set; } // 🔥 Kiểm tra có thêm reply không
        public Guid? ParentCommentId { get; set; } // Chỉ có ID của cha, không cần danh sách Replies
        public CommentDto() { }
        public CommentDto(Comment comment)
        {
            Id = comment.Id;
            UserId = comment.UserId;
            UserName = comment.User?.FullName ?? "Unknown";
            ProfilePicture = comment.User?.ProfilePicture;
            Content = comment.Content;
            CreatedAt = comment.CreatedAt;
            ParentCommentId = comment.ParentCommentId;

            var validLikes = comment.CommentLikes?.Where(l => l.IsLike).ToList() ?? new List<CommentLike>();

            // Ánh xạ số lượt like và danh sách người like
            LikeCountComment = comment.CommentLikes?.Count ?? 0;
/*            LikeCountComment = comment.CommentLikes?.Count(l => l.IsLike) ?? 0;*/
            HasMoreReplies = comment.Replies?.Any() ?? false; // Kiểm tra có thêm reply không
                                                              // Ánh xạ danh sách phản hồi (reply)
            /*  Replies = comment.Replies?
                 .Where(r => !r.IsDeleted)
                 .Take(10)
                 .Select(r => new CommentDto(r))
                 .ToList() ?? new List<CommentDto>();*/
        }
    }
}
