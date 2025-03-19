using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.Posts
{
    public class PostDto
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? ProfilePicture { get; set; }

        public string? Content { get;  set; }
        public string? ImageUrl { get; set; }

        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CommentCount { get; set; }
        public List<CommentDto> Comments { get; set; } = new();

        public int LikeCount { get; set; }
        public List<LikeDto> LikedUsers { get; set; } = new();

        public int ShareCount { get; set; }
        public List<ShareDto> SharedUsers { get; set; } = new();
        public bool IsSharedPost { get;  set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Guid? OriginalPostId { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public PostDto? OriginalPost { get; set; }

    }
}
