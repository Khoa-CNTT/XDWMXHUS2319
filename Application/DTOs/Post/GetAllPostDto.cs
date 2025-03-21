using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.Post
{
    public class GetAllPostDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? ProfilePicture { get; set; }

        public string? Content { get; set; }
        public string? ImageUrl { get; set; }

        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CommentCount { get; set; }

        public int LikeCount { get; set; }

        public int ShareCount { get; set; }
        public bool IsSharedPost { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Guid? OriginalPostId { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public OriginalPostDto? OriginalPost { get; set; }
    }
}
