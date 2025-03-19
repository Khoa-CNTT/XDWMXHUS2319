using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.CommentLikes
{
    public class CommentLikeDto
    {
        public int LikeCount { get; set; }
        public List<UserPostDto> LikedUsers { get; set; } = new();

        public CommentLikeDto() { }
        public CommentLikeDto(List<CommentLike> commentLikes)
        {
            LikeCount = commentLikes?.Count ?? 0;
            LikedUsers = commentLikes?.Select(like => new UserPostDto
            {
                UserId = like.User?.Id ?? Guid.Empty,
                UserName = like.User?.FullName ?? "Unknown",
                ProfilePicture = like.User?.ProfilePicture
            }).ToList() ?? new List<UserPostDto>();
        }
    }
}
