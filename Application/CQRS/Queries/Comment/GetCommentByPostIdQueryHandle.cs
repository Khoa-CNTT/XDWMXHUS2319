using Application.DTOs.Comments;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetCommentByPostIdQueryHandle : IRequestHandler<GetCommentByPostIdQuery, ResponseModel<List<CommentDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCommentByPostIdQueryHandle(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<List<CommentDto>>> Handle(GetCommentByPostIdQuery request, CancellationToken cancellationToken)
        {
            var (comments, totalRecords) = await _unitOfWork.CommentRepository.GetCommentByPostIdAsync(request.PostId, request.Page, request.PageSize);

            if (comments == null || !comments.Any())
            {
                return ResponseFactory.Success(new List<CommentDto>(), "Không có bình luận nào", 200);
            }

            var commentDtos = comments.Select(Mapping.MapToCommentByPostIdDto).ToList();
            return ResponseFactory.Success(commentDtos, "Lấy danh sách bình luận thành công", 200);
        }
    }
}
