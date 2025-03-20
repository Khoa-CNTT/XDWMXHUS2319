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
            // Lấy danh sách bài viết theo loại
            var posts = await _unitOfWork.PostRepository.GetPostsByTypeAsync(postTypeEnum);
            // Nếu không có bài viết nào, trả về danh sách rỗng nhưng vẫn có thông báo
            if (posts == null || !posts.Any())
            {
                return ResponseFactory.Success(new List<PostDto>(), $"Không có bài viết nào thuộc kiểu {postTypeEnum}", 200);
            }


            var postDtos = posts.Select(Mapping.MapToPostDto).ToList();
            return ResponseFactory.Success(postDtos,"Lấy thành công",200);
        }
    }
}
