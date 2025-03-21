using Application.DTOs.Comments;
using Application.DTOs.Shares;
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
    public class CommentPostCommandHandle : IRequestHandler<CommentPostCommand, ResponseModel<CommentPostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        public CommentPostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<CommentPostDto>> Handle(CommentPostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            if (post == null)
            {
                return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy bài viết này", 404);
            }

            // Kiểm tra số lần share của user đối với bài viết này
            // Nếu trong vòng 5 phút user đã share bài viết này quá 3 lần thì không cho share nữa
            var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
            var commentCount = await _unitOfWork.CommentRepository.CountPostCommentAsync(c =>
                c.UserId == userId && c.PostId == request.PostId && c.CreatedAt >= fiveMinutesAgo);

            if (commentCount >= 3)
            {
                return ResponseFactory.Fail<CommentPostDto>("Bạn đã bình luận bài viết này quá số lần cho phép trong thời gian ngắn. Cảnh báo spam!", 403);
            }


            if (!await _geminiService.ValidatePostContentAsync(request.Content))
            {
                return ResponseFactory.Fail<CommentPostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {             
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                var comment = new Comment(userId, request.PostId, request.Content);

                await _unitOfWork.CommentRepository.AddAsync(comment);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(Mapping.MapToCommentPostDto(comment, post, user), "Bình luận bài viết thành công", 200);
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<CommentPostDto>(ex.Message, 500);
            }
        }
    }
}
