using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Shares
{
    public class ResultSharePostDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string? ProfilePicture { get; set; }

        public string? Content { get; set; }
        public string? ImageUrl { get; set; }

        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdateAt { get; set; }
        public PostTypeEnum PostType { get; set; }
        public int CommentCount { get; set; }

        public int LikeCount { get; set; }

        public int ShareCount { get; set; }
        public int HasLiked { get; set; }
        public bool IsSharedPost { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Guid? OriginalPostId { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public OriginalPostDto? OriginalPost { get; set; }

    }
}
