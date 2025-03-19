using Application.DTOs.Comments;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class SoftDeleteCommentCommandHandle : IRequestHandler<SoftDeleteCommentCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public SoftDeleteCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(SoftDeleteCommentCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);

                if (comment == null)
                {
                    return ResponseFactory.Fail<bool>("Không tìm thấy bình luận này", 404);
                }
                if (comment.PostId == Guid.Empty)
                {
                    return ResponseFactory.Fail<bool>("Bình luận không thuộc bài viết nào", 404);
                }
                if (comment.UserId != userId)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bình luận này", 403);
                }
                if (comment.IsDeleted)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Bình luận này đã bị xóa", 404);
                }

                // Xóa mềm comment gốc
                comment.Delete();

                // 🔥 Tìm và xóa mềm tất cả các replies
                var replies = await _unitOfWork.CommentRepository.GetReplysCommentAllAsync(request.CommentId);
                foreach (var reply in replies)
                {
                    reply.Delete();
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Xóa bình luận và các phản hồi thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
    