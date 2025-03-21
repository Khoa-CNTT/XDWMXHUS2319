using Application.DTOs.Shares;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class ReplyCommentCommandHandle : IRequestHandler<ReplyCommentCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;

        public ReplyCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<bool>> Handle(ReplyCommentCommand request, CancellationToken cancellationToken)
        {
            // Lấy UserId từ context
            var userId = _userContextService.UserId();

            // Kiểm tra bình luận cha có tồn tại không
            var parentComment = await _unitOfWork.CommentRepository.GetByIdAsync(request.ParentCommentId);

            if (parentComment == null)
            {
                return ResponseFactory.Fail<bool>("Bình luận này không tồn tại", 404);
            }

            if (request.PostId != parentComment.PostId && request.PostId != Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Bình luận này không thuộc bài viết này", 400);
            }
            // Kiểm tra nội dung bình luận
            if (!await _geminiService.ValidatePostContentAsync(request.Content))
            {
                return ResponseFactory.Fail<bool>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Tạo bình luận phản hồi
                var replyComment = new Comment(userId, parentComment.PostId, request.Content ?? "")
                {
                    ParentCommentId = parentComment.Id
                };

                // Thêm vào database
                await _unitOfWork.CommentRepository.AddAsync(replyComment);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(true, "Phản hồi bình luận thành công", 201);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi khi phản hồi bình luận", 500, ex);
            }
        }
    }
}
