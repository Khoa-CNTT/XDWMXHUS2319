using Application.Common;
using Application.DTOs.AdminUserManagement;
using Application.DTOs.CommentLikes;
using Application.DTOs.Comments;
using Application.DTOs.FriendShips;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Reposts;
using Application.DTOs.Shares;
using Application.DTOs.User;
using Application.DTOs.UserScoreHistories;
using Domain.Entities;

namespace Application
{
    public static class Mapping
    {
        public static RideReportDto RideReportwithAdmin(RideReport rideReport)
        {
            return new RideReportDto
            {
                Id = rideReport.Id,
                RideId = rideReport.RideId,
                PassengerId = rideReport.PassengerId,
                PhonePassenger = rideReport.Passenger?.Phone,               
                RelativePhonePassenger = rideReport.Passenger?.RelativePhone,
                Message = rideReport.Message,
                AlertType = rideReport.AlertType,
                Status = rideReport.Status,
                CreatedAt = rideReport.CreatedAt
            };
        }
        public static ReportResponseDto ToResponseRepostDto(Report report)
        {
            return new ReportResponseDto
            {
                Id = report.Id,
                PostId = report.Id,
                Status = report.Status,
                CreatedAt = report.CreatedAt
            };
        }
        public static ReportDetailsDto ToRepostDetailsDto(Report report)
        {
            return new ReportDetailsDto
            {
                Id = report.Id,
                ReportedBy = report.ReportedBy,
                PostId = report.PostId,
                Reason = report.Reason,
                Status = report.Status,
                CreatedAt = report.CreatedAt,
                UpdatedAt = report.UpdatedAt,
                ProcessedByAI = report.ProcessedByAI,
                ProcessedByAdmin = report.ProcessedByAdmin,
                ViolationDetails = report.ViolationDetails,
                PreActionStatus = report.PreActionStatus,
                PostActionStatus = report.PostActionStatus,
                ViolationType = report.ViolationType,
                ActionTaken = report.ActionTaken
            };
        }

        public static PostWithReportsDto MapToPostWithReportsDto(Post post)
        {
            return new PostWithReportsDto
            {
                Id = post.Id,
                UserId = post.UserId,
                FullName = post.User?.FullName ?? "",
                ProfilePicture = post.User?.ProfilePicture,
                Content = post.Content,
                ImageUrl = post.ImageUrl,
                VideoUrl = post.VideoUrl,
                CreatedAt = post.CreatedAt,
                UpdateAt = post.UpdateAt,
                PostType = post.PostType,
                Scope = post.Scope,
                Reports = post.Reports.Select(r => new ReportDto
                {
                    Id = r.Id,
                    UserId = r.ReportedBy, // Ánh xạ từ ReportedBy
                    Username = r.ReportedByUser?.FullName ?? "Người dùng ẩn danh", // Ánh xạ từ ReportedByUser.Username
                    ProfilePicture = r.ReportedByUser?.ProfilePicture,
                    Reason = r.Reason,
                    ViolationDetails = r.ViolationDetails,
                    ProcessedByAI = r.ProcessedByAI, // Ánh xạ từ entity Report
                    ProcessedByAdmin = r.ProcessedByAdmin, // Ánh xạ từ entity Report
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                }).ToList()
            };
        }

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

        public static ResultSharePostDto MapToResultSharePostDto(Post share, Post originalPost, User user)
        {
            return new ResultSharePostDto
            {
                Id = share.Id,
                UserId = user.Id, // ✅ Người dùng đã chia sẻ bài viết
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture,
                Content = share.Content,
                CreatedAt = share.CreatedAt,
                PostType = originalPost.PostType,
                CommentCount =  0,
                LikeCount =0,
                ShareCount = 0,
                HasLiked = 0,
                IsSharedPost = true,
                OriginalPostId = originalPost.Id,
                OriginalPost = new OriginalPostDto(originalPost) // ✅ Đảm bảo bài viết gốc có đúng User
            };
        }


        public static FriendDto MapToFriendDto(Friendship friendship, User user, Guid currentUserId)
        {
            var otherUserId = friendship.UserId == currentUserId ? friendship.FriendId : friendship.UserId;

            return new FriendDto
            {
                FriendId = otherUserId,
                FullName = user.FullName,
                PictureProfile = user.ProfilePicture != null ? $"{Constaint.baseUrl}{user.ProfilePicture}" : null,
                CreatedAt = friendship.CreatedAt,
                Status = friendship.Status
            };
        }
        public static ScoreHistoriesResponseDto MapToScoreHistoriesResponseDto(UserScoreHistory scoreHistory)
        {
            return new ScoreHistoriesResponseDto
            {
                Id = scoreHistory.Id,
                UserId = scoreHistory.UserId,
                ScoreChange = scoreHistory.ScoreChange,
                Reason = scoreHistory.Reason ?? string.Empty,
                TotalScoreAfterChange = scoreHistory.TotalScoreAfterChange,
                CreatedAt = scoreHistory.CreatedAt
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
                ProfilePicture = profilePicture != null ? $"{Constaint.baseUrl}{profilePicture}" : null, // ✅ Thêm Base URL
                ParentCommentId = comment.ParentCommentId // 📌 Thêm ParentCommentId
            };
        }
        public static UserDto MapToUserDto(User? user)
        {
            return new UserDto
            {
                Id = user?.Id,
                FullName = user?.FullName,
                Email = user?.Email,
                CreatedAt = user?.CreatedAt ?? DateTime.MinValue, // ✅ Cung cấp giá trị mặc định
                ProfilePicture = user?.ProfilePicture != null ? $"{Constaint.baseUrl}{user?.ProfilePicture}" : null,
                status = user?.Status,
            };
        }
        public static UserManagerDto MapToUserAdminDto(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            return new UserManagerDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Bio = user.Bio,
                IsVerifiedEmail = user.IsVerifiedEmail,
                CreatedAt = user.CreatedAt,
                TrustScore = user.TrustScore,
                Role = user.Role,
                RelativePhone = user.RelativePhone,
                Phone = user.Phone,
                LastActive = user.LastLoginDate, 
                Status = user.Status, 
                TotalReports = user.TotalReports
            };
        }
        public static UserResponseDto MapUserToUserResponseDto(User user)
        {
            return new UserResponseDto
            {
                FullName = user.FullName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }

        public static List<UserResponseDto> MapUsersToUserResponseDtos(List<User> users)
        {
            return users.Select(MapUserToUserResponseDto).ToList();
        }
        public static UserReportGroupDto MapToUserReportDto(IEnumerable<UserReport> reports)
        {
            // Nhóm các báo cáo theo ReportedUserId
            var firstReport = reports.First(); // Lấy báo cáo đầu tiên trong nhóm
            return new UserReportGroupDto
            {
                ReportedUserId = firstReport.ReportedUserId,
                ReportedUserName = firstReport.ReportedUser?.FullName ?? "Unknown", // Lấy tên người bị báo cáo
                TotalReports = reports.Count(),
                Reports = reports.Select(r => new UserReportUserDto
                {
                    Id = r.Id,
                    ReportedByUserId = r.ReportedByUserId,
                    ReportedByUserName = r.ReportedByUser?.FullName ?? "Unknown", // Lấy tên người báo cáo
                    Reason = r.Reason,
                    ReportDate = r.ReportDate,
                    Status = r.Status
                }).ToList()
            };
        }
        public static List<UserReportGroupDto> MapToUserReportDtoList(IEnumerable<UserReport> reports)
        {
            // Nhóm các báo cáo theo ReportedUserId
            return reports
                .GroupBy(r => r.ReportedUserId) // Nhóm theo ReportedUserId
                .Select(group => MapToUserReportDto(group)) // Ánh xạ từng nhóm thành DTO
                .ToList();
        }
        public static MaptoUserprofileDetailDto MaptoUserprofileDto(User user)
        {
            return new MaptoUserprofileDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture != null ? $"{Constaint.baseUrl}{user.ProfilePicture}" : null,
                BackgroundPicture = user.BackgroundPicture != null ? $"{Constaint.baseUrl}{user.BackgroundPicture}" : null,
                Bio = user.Bio,
                TrustScore = user.TrustScore,
                CreatedAt = user.CreatedAt
            };
        }
        public static UserProfileDetailDto MaptoUserprofileDetailDto(User user)
        {
            return new UserProfileDetailDto
            {
                Id = user.Id,
                Email= user.Email,
                FullName = user.FullName,
                ProfilePicture = user.ProfilePicture != null ? $"{Constaint.baseUrl}{user.ProfilePicture}" : null,
                BackgroundPicture = user.BackgroundPicture != null ? $"{Constaint.baseUrl}{user.BackgroundPicture}" : null,
                Bio = user.Bio,
                Phone = user.Phone,
                PhoneRelative = user.RelativePhone,
                Gender = user.Gender,
                CreatedAt = user.CreatedAt
            };
        }
        public static UserUpdateInformationDto MaptoUserInformationDto(User user)
        {
            return new UserUpdateInformationDto
            {
                Id = user.Id,
                FullName = user.FullName,
                PhoneNumber = user.Phone,
                PhoneNumberRelative = user.RelativePhone,
                Gender = user.Gender,
                CreatedAt = user.CreatedAt
            };
        }
        public static CommentDto MapToCommentByPostIdDto(Comment comment, Guid userId)
        {
            /*            var validLikes = comment.CommentLikes?
                            .Where(l => l.IsLike) // 🔥 Chỉ lấy lượt like hợp lệ
                            .ToList() ?? new List<CommentLike>();*/
            return new CommentDto
            {
                Id = comment.Id,
                UserId = comment.UserId,
                UserName = comment.User?.FullName ?? "Unknown",
                ProfilePicture = comment.User?.ProfilePicture != null ? $"{Constaint.baseUrl}{comment.User?.ProfilePicture}" : null,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                ParentCommentId = comment.ParentCommentId,
                HasLiked = comment.CommentLikes?.Any(l => l.IsLike && l.UserId == userId) == true ? 1 : 0,
                // Ánh xạ số lượt like
                /*                CommentLikes = new CommentLikeDto(comment.CommentLikes?.Where(l => l.IsLike).ToList() ?? new List<CommentLike>()),*/
                LikeCountComment = comment.CommentLikes?.Count(l => l.IsLike) ?? 0, // ✅ Đếm số like hợp lệ
                HasMoreReplies = comment.Replies?.Any(r => !r.IsDeleted) == true
                // Chỉ lấy tối đa 10 comment con
                // 🔥 Cải tiến: Đệ quy để lấy mọi cấp reply (reply trong reply)
                /* Replies = comment.Replies?
                         .Where(r => !r.IsDeleted)
                         .OrderBy(r => r.CreatedAt)
                         .Select(r => MapToCommentByPostIdDto(r, userId)) // 💡 Gọi lại chính nó để lấy reply của reply
                         .ToList() ?? new List<CommentDto>()*/
            };
        }
       
        private static PostDto MapToOriginalPostDto(Post p)
        {            var originalPostDto = new PostDto
            {
                Id = p.Id,
                Content = p.Content,
                FullName = p.User?.FullName ?? "Unknown",
                ProfilePicture = p.User?.ProfilePicture ?? "default.jpg",
                ImageUrl = p.ImageUrl != null ? $"{Constaint.baseUrl}{p.ImageUrl}" : null, // ✅ Thêm Base URL
                VideoUrl = p.VideoUrl != null ? $"{Constaint.baseUrl}{p.VideoUrl}" : null, // ✅ Thêm Base URL
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
                ImageUrl = p.ImageUrl != null ? $"{Constaint.baseUrl}{p.ImageUrl}" : null, // ✅ Thêm Base URL
                VideoUrl = p.VideoUrl != null ? $"{Constaint.baseUrl}{p.VideoUrl}" : null, // ✅ Thêm Base URL
                CreateAt = p.CreatedAt,
                PostType = p.PostType,
                Scope = p.Scope,
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
/*                        Replies = allComments
                            .Where(r => r.ParentCommentId == c.Id)
                            .ToList()*/
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
        {            // Lọc các comment chưa bị xóa mềm
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
                ProfilePicture = p.User?.ProfilePicture != null ? $"{Constaint.baseUrl}{p.User.ProfilePicture}" : null, // ✅ Thêm Base URL
                ImageUrl = p.ImageUrl != null ? $"{Constaint.baseUrl}{p.ImageUrl}" : null, // ✅ Thêm Base URL
                VideoUrl = p.VideoUrl != null ? $"{Constaint.baseUrl}{p.VideoUrl}" : null, // ✅ Thêm Base URL
                CreatedAt = p.CreatedAt,
                UpdateAt = p.UpdateAt,
                PostType = p.PostType,
                Scope = p.Scope,
                CommentCount = p.Comments?.Count ?? 0,
                LikeCount = p.Likes?.Count ?? 0,
                ShareCount = p.Shares?.Count(s => !s.IsDeleted) ?? 0,
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
