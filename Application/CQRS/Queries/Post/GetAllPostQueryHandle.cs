using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
using Application.Interface.ContextSerivce;
using Domain.Interface;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetAllPostQueryHandle : IRequestHandler<GetAllPostQuery, ResponseModel<GetPostsResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostService _postService;
        private readonly IUserContextService _userContextService;
        public GetAllPostQueryHandle(IUnitOfWork unitOfWork, IPostService postService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _postService = postService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<GetPostsResponse>> Handle(GetAllPostQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var postsResponse = await _postService.GetPostsWithCursorAsync(request.LastPostId, request.PageSize, cancellationToken);

            if (postsResponse?.Posts == null || !postsResponse.Posts.Any())
            {
                return ResponseFactory.Success<GetPostsResponse>("Không còn bài viết nào để load", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy bài viết thành công", 200);
        }
    }
}

