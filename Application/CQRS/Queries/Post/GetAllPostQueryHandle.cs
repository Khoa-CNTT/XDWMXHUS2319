using Application.DTOs.Comments;
using Application.DTOs.Likes;
using Application.DTOs.Post;
using Application.DTOs.Posts;
using Application.DTOs.Shares;
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
        private readonly ILogger<GetAllPostQueryHandle> _logger;
        private readonly IPostService _postService;
        public GetAllPostQueryHandle(IUnitOfWork unitOfWork, ILogger<GetAllPostQueryHandle> logger, IPostService postService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _postService = postService;
        }

        public async Task<ResponseModel<GetPostsResponse>> Handle(GetAllPostQuery request, CancellationToken cancellationToken)
        {
            var postsResponse = await _postService.GetPostsWithCursorAsync(request.LastPostId, request.PageSize, cancellationToken);

            if (postsResponse == null || !postsResponse.Posts.Any())
            {
                _logger.LogInformation("Không còn bài viết nào để load");
                return ResponseFactory.Success<GetPostsResponse>("Không còn bài viết nào để load", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy bài viết thành công", 200);
        }
    }
}

