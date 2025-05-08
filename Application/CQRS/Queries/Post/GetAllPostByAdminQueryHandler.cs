using Application.CQRS.Queries.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetAllPostByAdminQueryHandler : IRequestHandler<GetAllPostByAdminQuery, ResponseModel<GetPostsResponseAdminDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostService _postService;
        private readonly IUserContextService _userContextService;
        public GetAllPostByAdminQueryHandler(IUnitOfWork unitOfWork, IPostService postService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _postService = postService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<GetPostsResponseAdminDto>> Handle(GetAllPostByAdminQuery request, CancellationToken cancellationToken)
        {
            // Lấy userId từ context
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<GetPostsResponseAdminDto>("Không thể xác định người dùng", 401);
            }


            int skip = (request.PageNumber - 1) * request.PageSize;
            int take = request.PageSize;

            var postsResponse = await _postService.GetAllPostsByAdminAsync(skip, take, cancellationToken);

            if (postsResponse?.Posts == null || !postsResponse.Posts.Any())
            {
                return ResponseFactory.Success<GetPostsResponseAdminDto>("Không có bài viết nào", 200);
            }

            return ResponseFactory.Success(postsResponse, "Lấy danh sách bài viết thành công", 200);
        }
    }
}

