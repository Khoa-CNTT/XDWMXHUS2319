using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostByOwnerFriendQueryHandler : IRequestHandler<GetPostByOwnerFriendQuery, ResponseModel<GetPostsResponse>>
    {
        private readonly IPostService _postService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public GetPostByOwnerFriendQueryHandler(IPostService postService, IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _postService = postService;
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<GetPostsResponse>> Handle(GetPostByOwnerFriendQuery request, CancellationToken cancellationToken)
        {
            var postsResponse = await _postService.GetPostsByOwnerFriendWithCursorAsync(request.UserId ,request.LastPostId, request.PageSize, cancellationToken);

            if (postsResponse == null || !postsResponse.Posts.Any())
            {
                return ResponseFactory.Success<GetPostsResponse>("Không còn bài viết nào để load", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy bài viết thành công", 200);
        }
    }
}
