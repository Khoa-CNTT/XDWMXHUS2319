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
        public CommentDto() { }
        public CommentDto(Comment comment)
        {
            Id = comment.Id;
            UserId = comment.UserId;
            UserName = comment.User?.FullName ?? "Unknown";
            ProfilePicture = comment.User?.ProfilePicture;
            Content = comment.Content;
            CreatedAt = comment.CreatedAt;
        }
    }
}
