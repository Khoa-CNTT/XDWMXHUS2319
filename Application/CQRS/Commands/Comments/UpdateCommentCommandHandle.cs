using Application.DTOs.Comments;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class UpdateCommentCommandHandle : IRequestHandler<UpdateCommentCommand, ResponseModel<CommentPostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        public UpdateCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<CommentPostDto>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
                if (post == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy bài viết này", 404);
                }
                var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);
                if (comment == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy bình luận này", 404);
                }
                // Kiểm tra xem user có quyền chỉnh sửa comment hay không
                if (comment.UserId != userId)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Bạn không có quyền chỉnh sửa bình luận này", 403);
                }
                if(request.Content == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Nội dung bình luận không được để trống", 400);
                }
                if(request.PostId != comment.PostId)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Bình luận không thuộc bài viết này", 400);
                }
                var result = await _geminiService.ValidatePostContentAsync(request.Content);
                if (!result)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<CommentPostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                comment.Edit(request.Content);
                await _unitOfWork.CommentRepository.UpdateAsync(comment);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(Mapping.MapToCommentPostDto(comment, post, user), "Chỉnh sửa bình luận thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<CommentPostDto>(ex.Message, 500);
            }       
        }
    }
}
