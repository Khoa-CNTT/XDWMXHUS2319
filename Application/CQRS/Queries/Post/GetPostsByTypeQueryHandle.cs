using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Queries.Posts
{
    public class GetPostsByTypeQueryHandle : IRequestHandler<GetPostsByTypeQuery, ResponseModel<List<PostDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public GetPostsByTypeQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<List<PostDto>>> Handle(GetPostsByTypeQuery request, CancellationToken cancellationToken)
        {
            // Chuyển đổi request.PostType từ string -> PostTypeEnum

            if (!Enum.TryParse<PostTypeEnum>(request.PostType, true, out var postTypeEnum))
            {
                return ResponseFactory.Fail<List<PostDto>>("Post type is invalid", 400);
            }
            var posts = await _unitOfWork.PostRepository.GetPostsByTypeAsync(postTypeEnum);
            if (posts == null)
            {
                return ResponseFactory.Success<List<PostDto>>("Không tìm thấy bài viết nào", 404);
            }
            var postDtos = posts.Select(post => new PostDto
            {
                Id = post.Id,
                Content = post.Content,
                FullName = post.User?.FullName ?? "Unknown",  // Lấy tên người đăng bài
                ImageUrl = post.ImageUrl,                     // Ảnh đính kèm
                VideoUrl = post.VideoUrl,                     // Video đính kèm
                CreatedAt = post.CreatedAt,

                // Đếm số lượt bình luận
                CommentCount = post.Comments?.Count ?? 0,
                Comments = post.Comments?.Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    UserName = c.User?.FullName ?? "Unknown",
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                }).ToList() ?? new List<CommentDto>(),

                // Đếm số lượt thích
                LikeCount = post.Likes?.Count ?? 0,
                LikedUsers = post.Likes?.Select(l => new LikeDto
                {
                    UserId = l.UserId,
                    UserName = l.User?.FullName ?? "Unknown"
                }).ToList() ?? new List<LikeDto>(),

                // Đếm số lượt chia sẻ
                ShareCount = post.Shares?.Count ?? 0,
                SharedUsers = post.Shares?.Select(s => new ShareDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.FullName ?? "Unknown",
                    SharedAt = s.CreatedAt
                }).ToList() ?? new List<ShareDto>()
            }).ToList();
            return ResponseFactory.Success(postDtos,"Lấy thành công",200);
        }
    }
}
