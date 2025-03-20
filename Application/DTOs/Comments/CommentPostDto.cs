using Application.DTOs.Post;
using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Comments
{
    public class CommentPostDto
    {
        public Guid CommentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Content { get; set; }
        public UserPostDto? User { get; set; }
        public OriginalPostDto? OriginalPost { get; set; }
    }
}
