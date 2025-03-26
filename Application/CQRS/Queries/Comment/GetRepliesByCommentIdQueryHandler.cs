using Application.DTOs.Comments;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetRepliesByCommentIdQueryHandler : IRequestHandler<GetRepliesByCommentIdQuery, ResponseModel<GetRepliesResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public GetRepliesByCommentIdQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<GetRepliesResponse>> Handle(GetRepliesByCommentIdQuery request, CancellationToken cancellationToken)
        {
            int pageSize = 5; // 🔥 Mỗi lần lấy 5 reply
            var userId = _userContextService.UserId();

            // 🟢 Lấy danh sách reply từ Repository (thêm 1 để check hasMoreReplies)
            var replies = await _unitOfWork.CommentRepository
                .GetRepliesByCommentIdWithCursorAsync(request.ParentCommentId, request.LastReplyId, pageSize, cancellationToken);

            if (!replies.Any())
            {
                return ResponseFactory.Success(new GetRepliesResponse(), "Không có thêm phản hồi", 200);
            }

            // 🔥 Kiểm tra xem còn reply nào nữa không
            bool hasMoreReplies = replies.Count > pageSize;
            var filteredReplies = replies.Take(pageSize).ToList(); // Chỉ lấy đúng `pageSize`

            return ResponseFactory.Success(new GetRepliesResponse
            {
                Replies = filteredReplies.Select(c =>
                {
                    var dto = Mapping.MapToCommentByPostIdDto(c, userId);
                    dto.HasMoreReplies = _unitOfWork.CommentRepository.HasMoreReplies(c.Id); // 🔥 Kiểm tra reply con
                    return dto;
                }).ToList(),
                LastReplyId = hasMoreReplies ? filteredReplies.Last().Id : null
            }, "Lấy danh sách phản hồi thành công", 200);
        }
    }
}
