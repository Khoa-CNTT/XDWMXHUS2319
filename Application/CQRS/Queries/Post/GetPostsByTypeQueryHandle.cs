using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
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
    public class GetPostsByTypeQueryHandle : IRequestHandler<GetPostsByTypeQuery, ResponseModel<GetPostsResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostService _postService;
        public GetPostsByTypeQueryHandle(IUnitOfWork unitOfWork, IPostService postService)
        {
            _unitOfWork = unitOfWork;
            _postService = postService;
        }
        public async Task<ResponseModel<GetPostsResponse>> Handle(GetPostsByTypeQuery request, CancellationToken cancellationToken)
        {
            if (!Enum.TryParse<PostTypeEnum>(request.PostType, out var postTypeEnum))
            {
                return ResponseFactory.Fail<GetPostsResponse>("Loại bài viết không hợp lệ", 400);
            }

            var postsResponse = await _postService.GetPostByTypeWithCursorAsync(postTypeEnum, request.LastPostId, request.PageSize, cancellationToken);

            if (!postsResponse.Posts.Any())
            {
                return ResponseFactory.Success<GetPostsResponse>("Không còn bài viết nào để load", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy bài viết thành công", 200);
        }
    }
}
