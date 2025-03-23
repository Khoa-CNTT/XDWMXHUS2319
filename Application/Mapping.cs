using Application.DTOs.CommentLikes;
using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Domain.Entities;

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
        public static ResultSharePostDto MapToResultSharePostDto(Share share, Post post, User user)
        {
            return new ResultSharePostDto
            {
                ShareId = share.Id,
                SharedAt = share.CreatedAt,
                Content = share.Content,
                User = new UserPostDto(user),
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
        public static ResultCommentDto MapToResultCommentPostDto(Comment comment, string fullName, string? profilePicture)
        {
            return new ResultCommentDto
            {
                CommentId = comment.Id,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
                Content = comment.Content,
                FullName = fullName,
                ProfilePicture = profilePicture,
            };
        }
        public static UserDto MapToUserDto(User? user)
        {
            return new UserDto
            {
                Id = user?.Id,
                FullName = user?.FullName,
                Email = user?.Email,
                ProfilePicture = user?.ProfilePicture,
                
            };
        }
        public static UserProfileDto MaptoUserprofileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt
            };
        }
        public static CommentDto MapToCommentByPostIdDto(Comment comment, Guid userId)
        {
            var validLikes = comment.CommentLikes?
                .Where(l => l.IsLike) // 🔥 Chỉ lấy lượt like hợp lệ
                .ToList() ?? new List<CommentLike>();

            return new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                UserName = comment.User?.FullName ?? "Unknown",
                ProfilePicture = comment.User?.ProfilePicture,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                ParentCommentId = comment.ParentCommentId,
                HasLiked = validLikes.Any(l => l.UserId == userId) ? 1 : 0,
                // Ánh xạ số lượt like
                /*                CommentLikes = new CommentLikeDto(comment.CommentLikes?.Where(l => l.IsLike).ToList() ?? new List<CommentLike>()),*/
                LikeCountComment = comment.CommentLikes?.Count ?? 0,

                // Chỉ lấy tối đa 10 comment con
                Replies = comment.Replies?
                    .OrderBy(r => r.CreatedAt)
                    .Take(10)
                    .Select(r => MapToCommentByPostIdDto(r, userId))
                    .ToList() ?? new List<CommentDto>()
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
               /* Comments = p.Comments?.Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "Unknown",
                    ProfilePicture = c.User?.ProfilePicture,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt

                }).ToList() ?? new List<CommentDto>(),*/

                // Đếm số lượt thích
                LikeCount = p.Likes?.Count ?? 0,
               /* LikedUsers = p.Likes?.Select(l => new LikeDto
                {
                    UserId = l.UserId,
                    UserName = l.User?.FullName ?? "Unknown",
                    ProfilePicture = l.User?.ProfilePicture,
                }).ToList() ?? new List<LikeDto>(),*/

                // Đếm số lượt chia sẻ
                ShareCount = p.Shares?.Count ?? 0,
               /* SharedUsers = p.Shares?.Select(s => new ShareDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.FullName ?? "Unknown",
                    ProfilePicture = s.User?.ProfilePicture,
                    SharedAt = s.CreatedAt
                }).ToList() ?? new List<ShareDto>()*/
            };

            // Chỉ thêm nếu bài viết thực sự là bài share
            if (p.IsSharedPost && p.OriginalPostId != null)
            {
                originalPostDto.IsSharedPost = true;
                originalPostDto.OriginalPostId = p.OriginalPostId;
            }

            return originalPostDto;
        }
        private static OriginalPostDto MapToAllOriginalPostDto(Post p)
        {
            var originalPostDto = new OriginalPostDto
            {
                PostId = p.Id,
                Content = p.Content,
                ImageUrl = p.ImageUrl,
                VideoUrl = p.VideoUrl,
                CreateAt = p.CreatedAt,
                Author = new UserPostDto(p.User ?? new Domain.Entities.User("Người dùng ẩn danh", "anonymous@example.com", "hashed_password"))
            };

            return originalPostDto;
        }
        public static PostDto MapToPostDto(Post p)
        {
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
/*                        CommentLikes = c.CommentLikes,*/
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
        public static GetAllPostDto MapToAllPostDto(Post p, Guid userId)
        {
            // Lọc các comment chưa bị xóa mềm
            var allComments = p.Comments?
                .Where(c => !c.IsDeleted) // 🔥 Lọc comment hợp lệ
                .Select(c => new CommentDto(c))
                .ToList() ?? new List<CommentDto>();

            // 🔥 Lọc các lượt thích hợp lệ (IsLike == true)
            var validLikes = p.Likes?
                .Where(l => l.IsLike) // Chỉ lấy những lượt thích hợp lệ
                .ToList() ?? new List<Like>();

            return new GetAllPostDto
            {
                Id = p.Id,
                UserId = p.UserId,
                Content = p.Content,
                FullName = p.User?.FullName ?? "Unknown",
                ProfilePicture = p.User?.ProfilePicture,
                ImageUrl = p.ImageUrl,
                VideoUrl = p.VideoUrl,
                CreatedAt = p.CreatedAt,
                UpdateAt = p.UpdateAt,
                PostType = p.PostType,
                CommentCount = p.Comments?.Count ?? 0,
                LikeCount = p.Likes?.Count ?? 0,
                ShareCount = p.Shares?.Count ?? 0,
                HasLiked = validLikes.Any(l => l.UserId == userId) ? 1 : 0,
                IsSharedPost = p.IsSharedPost,
                OriginalPostId = p.OriginalPostId,

                OriginalPost = p.IsSharedPost && p.OriginalPost != null
                    ? MapToAllOriginalPostDto(p.OriginalPost)
                    : null,
            };
        }
    }
}
