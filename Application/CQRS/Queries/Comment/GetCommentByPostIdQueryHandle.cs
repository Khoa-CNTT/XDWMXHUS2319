using Application.DTOs.Comments;
using Application.Interface.ContextSerivce;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetCommentByPostIdQueryHandle : IRequestHandler<GetCommentByPostIdQuery, ResponseModel<GetCommentsResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IPostService _postService;

        public GetCommentByPostIdQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IPostService postService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _postService = postService;
        }

        public async Task<ResponseModel<GetCommentsResponse>> Handle(GetCommentByPostIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var response = await _postService.GetCommentByPostIdWithCursorAsync(request.PostId, request.LastCommentId, cancellationToken);

            if (!response.Comments.Any())
            {
                return ResponseFactory.Success(response, "Không có bình luận nào", 200);
            }

            return ResponseFactory.Success(response, "Lấy danh sách bình luận thành công", 200);
        }
    }
}
