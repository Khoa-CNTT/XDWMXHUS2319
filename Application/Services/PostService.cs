using Application.DTOs.Comments;
using Application.DTOs.Post;
using Application.DTOs.Shares;
using Application.Interface.ContextSerivce;
using Domain.Entities;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.Services
{
    public class PostService : IPostService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public PostService(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<GetPostsResponseAdminDto> GetAllPostsByAdminAsync(int skip, int take, CancellationToken cancellationToken)
        {
            var posts = await _unitOfWork.PostRepository.GetAllPostsForAdminAsync(skip, take, cancellationToken);

            var postDtos = posts.Select(post => new PostAdminDto
            {
                Id = post.Id,
                Content = post.Content,
                Author = post.User?.FullName ?? "Unknown", // Giả sử User có thuộc tính FullName
                CreatedAt = post.CreatedAt,
                ApprovalStatus = post.ApprovalStatus,
                Scope = post.Scope,
                PostType = post.PostType,
                IsDeleted = post.IsDeleted,
                IsSharedPost = post.IsSharedPost,
                Score = post.Score ?? 0,
                ReportCount = post.Reports?.Count ?? 0
            }).ToList();

            return new GetPostsResponseAdminDto
            {
                Posts = postDtos,
                TotalCount = await _unitOfWork.PostRepository.GetTotalPostCountAsync(cancellationToken)
            };
        }
        public async Task<Guid> GetPostOwnerId(Guid postId)
        {
           return await _unitOfWork.PostRepository.GetPostOwnerIdAsync(postId);
        }
        public async Task<GetPostsResponse?> GetPostsWithCursorAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            const int PAGE_SIZE = 10;

            var posts = await _unitOfWork.PostRepository.GetAllPostsAsync(lastPostId, pageSize, cancellationToken);

            // ⚠️ Nếu không có bài viết nào nữa
            if (posts == null || posts.Count == 0)
            {
                return new GetPostsResponse
                {
                    Posts = new List<GetAllPostDto>(),
                    NextCursor = null
                };
            }

            var nextCursor = (posts.Count == PAGE_SIZE) ? (Guid?)posts.Last().Id : null;

            return new GetPostsResponse
            {
                Posts = posts.Select(post => Mapping.MapToAllPostDto(post, userId)).ToList(),
                NextCursor = nextCursor
            };
        }
        public async Task<GetPostsResponse> GetPostsByOwnerFriendWithCursorAsync(Guid userId, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            const int PAGE_SIZE = 10;

            // 🟢 Lấy danh sách bài viết theo chủ sở hữu
            var posts = await _unitOfWork.PostRepository.GetPostsByOwnerAsync(userId, lastPostId, pageSize, cancellationToken);

            // 🟢 Xác định nextCursor nếu còn bài viết
            var nextCursor = (posts.Count == PAGE_SIZE) ? (Guid?)posts.Last().Id : null;

            return new GetPostsResponse
            {
                Posts = posts.Select(post => Mapping.MapToAllPostDto(post, userId)).ToList(),
                NextCursor = nextCursor
            };
        }

        public async Task<GetPostsResponse> GetPostsByOwnerWithCursorAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            // 🟢 Lấy UserId từ IUserContextService (Kiểm tra nếu là phương thức)
            var userId = _userContextService.UserId(); // Nếu lỗi, sửa thành: _userContextService.UserId();
            const int PAGE_SIZE = 10;

            // 🟢 Lấy danh sách bài viết theo chủ sở hữu
            var posts = await _unitOfWork.PostRepository.GetPostsByOwnerAsync(userId, lastPostId, pageSize, cancellationToken);

            // 🟢 Xác định nextCursor nếu còn bài viết
            var nextCursor = (posts.Count == PAGE_SIZE) ? (Guid?)posts.Last().Id : null;

            return new GetPostsResponse
            {
                Posts = posts.Select(post => Mapping.MapToAllPostDto(post, userId)).ToList(),
                NextCursor = nextCursor
            };
        }

        public async Task<GetCommentsResponse> GetCommentByPostIdWithCursorAsync(Guid postId, Guid? lastCommentId, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            int pageSize = 10; // 📌 Set cứng pageSize = 5
            var comments = await _unitOfWork.CommentRepository.GetCommentsByPostIdWithCursorAsync(postId, lastCommentId, pageSize, cancellationToken);

            if (!comments.Any())
            {
                return new GetCommentsResponse
                {
                    Comments = new List<CommentDto>(),
                    LastCommentId = null
                };
            }

            return new GetCommentsResponse
            {
                Comments = comments.Select(c => Mapping.MapToCommentByPostIdDto(c, userId)).ToList(),
                LastCommentId = comments.Count < pageSize ? null : comments.Last().Id
            };
        }

        public async Task<GetPostsResponse> GetPostByTypeWithCursorAsync(PostTypeEnum postTypeEnum, Guid? lastPostId, int pageSize, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            const int PAGE_SIZE = 10;
            // 🔥 Gọi đúng phương thức với đủ tham số
            var posts = await _unitOfWork.PostRepository.GetPostsByTypeAsync(postTypeEnum, lastPostId, pageSize, cancellationToken);

            // ✅ Kiểm tra số lượng bài viết hợp lệ
            var nextCursor = (posts.Count == PAGE_SIZE) ? (Guid?)posts.Last().Id : null;

            return new GetPostsResponse
            {
                Posts = posts.Select(post => Mapping.MapToAllPostDto(post, userId)).ToList(), // 🔥 Truyền userId vào
                NextCursor = nextCursor
            };
        }
        public async Task<bool> IsUserSpammingSharesAsync(Guid userId, Guid postId)
        {
            var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
            var shareCount = await _unitOfWork.ShareRepository.CountPostShareAsync(p =>
                p.UserId == userId && p.PostId == postId && p.CreatedAt >= fiveMinutesAgo);

            return shareCount >= 3;
        }

        public async Task SoftDeletePostAndRelatedDataAsync(Guid postId)
        {
            // 🔥 Xóa bài gốc
            var post = await _unitOfWork.PostRepository.GetByIdAsync(postId);
            if (post != null && !post.IsDeleted)
            {
                post.Delete();
            }

            // 🔥 Xóa tất cả comments của bài
            var comments = await _unitOfWork.CommentRepository.GetCommentsByPostIdDeleteAsync(postId);
            foreach (var comment in comments)
            {
                await SoftDeleteCommentAndRepliesAsync(comment.Id);
            }
            // 🔥 Xóa tất cả likes của bài
            var likes = await _unitOfWork.LikeRepository.GetLikesByPostIdDeleteAsync(postId);
            foreach (var like in likes)
            {
                like.Delete();
            }

            // 🔥 Xóa tất cả bài chia sẻ của bài (đệ quy)
            var sharedPosts = await _unitOfWork.ShareRepository.GetSharedPostAllDeleteAsync(postId);
            foreach (var sharedPost in sharedPosts)
            {
                await SoftDeletePostAndRelatedDataAsync(sharedPost.Id);
            }
            // 🔥 Xóa tất cả bài share liên quan đến bài viết này
            var shares = await _unitOfWork.ShareRepository.GetSharesByPostIdAsync(postId);
            foreach (var share in shares)
            {
                share.SoftDelete(); // ✅ Xóa mềm bài chia sẻ
            }
        }
        public async Task SoftDeleteCommentAndRepliesAsync(Guid commentId)
        {
            var comment = await _unitOfWork.CommentRepository.GetByIdAsync(commentId);
            if (comment != null && !comment.IsDeleted)
            {
                // Xóa mềm comment
                comment.Delete();

                // 🔥 Xóa tất cả like của comment
                var commentLikes = await _unitOfWork.CommentLikeRepository.GetCommentLikeByCommentIdAsync(commentId);
                foreach (var like in commentLikes)
                {
                    like.UnLike();
                }

                // 🔥 Tìm tất cả reply của comment này và xóa mềm đệ quy
                var replies = await _unitOfWork.CommentRepository.GetRepliesByCommentIdAsync(commentId);
                foreach (var reply in replies)
                {
                    await SoftDeleteCommentAndRepliesAsync(reply.Id);
                }
            }
        }

    }
}
