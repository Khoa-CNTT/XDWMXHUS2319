using Application.DTOs.Post;
using Application.Interface.ContextSerivce;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostsByOwnerQueryHandle : IRequestHandler<GetPostsByOwnerQuery, ResponseModel<GetPostsResponse>>
    {
        private readonly IPostService _postService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public GetPostsByOwnerQueryHandle(IPostService postService, IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _postService = postService;
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<GetPostsResponse>> Handle(GetPostsByOwnerQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var postsResponse = await _postService.GetPostsByOwnerWithCursorAsync(request.LastPostId, request.PageSize, cancellationToken);

            if (postsResponse == null || !postsResponse.Posts.Any())
            {
                return ResponseFactory.Success<GetPostsResponse>("Không còn bài viết nào để load", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy bài viết thành công", 200);
        }
    }
}
