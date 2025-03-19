using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public static class Mapping
    {

        //SHARE POST DTO MAPPER
        public static SharePostDto MapToSharePostDto(Share share, Post post, User user)
        {
            return new SharePostDto
            {
                ShareId = share.Id,
                SharedAt = share.CreatedAt,
                Content = share.Content,
                User = new UserPostDto(user),
                OriginalPost = new OriginalPostDto(post)
            };
        }
        public static CommentPostDto MapToCommentPostDto(Comment comment, Post post, User user)
        {
            return new CommentPostDto
            {
                CommentId = comment.Id,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Content = comment.Content,
                User = new UserPostDto(user),
                OriginalPost = new OriginalPostDto(post)
            };
        }
        public static UserDto MapToUserDto(this User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture
            };
        }
        private static PostDto MapToOriginalPostDto(Post p)
        {
            var originalPostDto = new PostDto
            {
                Id = p.Id,
                Content = p.Content,
                FullName = p.User?.FullName ?? "Unknown",
                ProfilePicture = p.User?.ProfilePicture ?? "default.jpg",
                ImageUrl = p.ImageUrl,
                VideoUrl = p.VideoUrl,
                CreatedAt = p.CreatedAt,
                IsSharedPost = p.IsSharedPost,
                OriginalPostId = p.OriginalPostId,

                CommentCount = p.Comments?.Count ?? 0,
                Comments = p.Comments?.Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "Unknown",
                    ProfilePicture = c.User?.ProfilePicture,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt

                }).ToList() ?? new List<CommentDto>(),

                // Đếm số lượt thích
                LikeCount = p.Likes?.Count ?? 0,
                LikedUsers = p.Likes?.Select(l => new LikeDto
                {
                    UserId = l.UserId,
                    UserName = l.User?.FullName ?? "Unknown",
                    ProfilePicture = l.User?.ProfilePicture,
                }).ToList() ?? new List<LikeDto>(),

                // Đếm số lượt chia sẻ
                ShareCount = p.Shares?.Count ?? 0,
                SharedUsers = p.Shares?.Select(s => new ShareDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.FullName ?? "Unknown",
                    ProfilePicture = s.User?.ProfilePicture,
                    SharedAt = s.CreatedAt
                }).ToList() ?? new List<ShareDto>()
            };

            // Chỉ thêm nếu bài viết thực sự là bài share
            if (p.IsSharedPost && p.OriginalPostId != null)
            {
                originalPostDto.IsSharedPost = true;
                originalPostDto.OriginalPostId = p.OriginalPostId;
            }

            return originalPostDto;
        }
        public static PostDto MapToPostDto(Post p)
        {
            if (p == null || p.IsDeleted)
            {
                return null; // 🔥 Nếu bài viết bị xóa, trả về null
            }

            // Lọc các comment chưa bị xóa mềm
            var allComments = p.Comments?
                .Where(c => !c.IsDeleted) // 🔥 Lọc comment hợp lệ
                .Select(c => new CommentDto(c))
                .ToList() ?? new List<CommentDto>();

            // 🔥 Lọc các lượt thích hợp lệ (IsLike == true)
            var validLikes = p.Likes?
                .Where(l => l.IsLike) // Chỉ lấy những lượt thích hợp lệ
                .ToList() ?? new List<Like>();

            return new PostDto
            {
                Id = p.Id,
                Content = p.Content,
                FullName = p.User?.FullName ?? "Unknown",
                ProfilePicture = p.User?.ProfilePicture,
                ImageUrl = p.ImageUrl,
                VideoUrl = p.VideoUrl,
                CreatedAt = p.CreatedAt,
                IsSharedPost = p.IsSharedPost,
                OriginalPostId = p.OriginalPostId,

                // Nếu là bài share, ánh xạ bài viết gốc
                OriginalPost = p.IsSharedPost && p.OriginalPost != null
                    ? MapToOriginalPostDto(p.OriginalPost)
                    : null,

                // Đếm số lượt bình luận hợp lệ
                CommentCount = allComments.Count,

                // 🔥 Chỉ lấy comment gốc (ParentCommentId == null) và chưa bị xóa
                Comments = allComments
                    .Where(c => c.ParentCommentId == null)
                    .Select(c => new CommentDto
                    {
                        Id = c.Id,
                        UserId = c.UserId,
                        UserName = c.UserName,
                        ProfilePicture = c.ProfilePicture,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt,
                        CommentLikes = c.CommentLikes,
                        ParentCommentId = c.ParentCommentId,

                        // 🔥 Lọc replies chưa bị xóa
                        Replies = allComments
                            .Where(r => r.ParentCommentId == c.Id)
                            .ToList()
                    })
                    .ToList(),

                // 🔥 Đếm số lượt thích hợp lệ
                LikeCount = validLikes.Count,

                // 🔥 Lọc danh sách người đã thích bài viết (chỉ lấy những ai có IsLike = true)
                LikedUsers = validLikes
                    .Select(l => new LikeDto
                    {
                        UserId = l.UserId,
                        UserName = l.User?.FullName ?? "Unknown",
                        ProfilePicture = l.User?.ProfilePicture,
                    })
                    .ToList(),

                // Đếm số lượt chia sẻ
                ShareCount = p.Shares?.Count ?? 0,
                SharedUsers = p.Shares?.Select(s => new ShareDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.FullName ?? "Unknown",
                    ProfilePicture = s.User?.ProfilePicture,
                    SharedAt = s.CreatedAt
                }).ToList() ?? new List<ShareDto>()
            };
        }
    }
}
