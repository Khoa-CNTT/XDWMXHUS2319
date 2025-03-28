using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Comments
{
    public class ResultCommentDto
    {
        public Guid CommentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
         public string? Content { get; set; }
         public required string FullName { get; set; }
         public string? ProfilePicture { get; set; }
        public Guid? ParentCommentId { get; set; } // 📌 Thêm ParentCommentId (có thể null)
    }
    }

