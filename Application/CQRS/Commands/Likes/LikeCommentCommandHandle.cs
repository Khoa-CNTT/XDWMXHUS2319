using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Likes
{
    public class LikeCommentCommandHandle : IRequestHandler<LikeCommentCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public LikeCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(LikeCommentCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra comment có tồn tại không
            var userId = _userContextService.UserId();
            // Tìm comment theo id
            var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);
            //Kiểm tra comment có tồn tại không
            if (comment == null)
            {
                return ResponseFactory.Fail<bool>("Comment không tồn tại!", 404);
            }
            //Kiểm tra post có tồn tại không
            var post = await _unitOfWork.PostRepository.GetByIdAsync(comment.PostId);
            if (post == null || post.Id == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bài viết chứa bình luận này!", 404);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {        
                // Kiểm tra user đã like comment này chưa
                var existingLike = await _unitOfWork.CommentLikeRepository.GetLikeAsync(userId, request.CommentId);
                if (existingLike != null)
                {
                    // Nếu đã like, chuyển thành dislike
                    existingLike.SetLikeStatus(!existingLike.IsLike);
                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();

                    string message = existingLike.IsLike ? "Bạn đã thích bình luận!" : "Bạn đã bỏ thích bình luận!";
                    return ResponseFactory.Success(true, message, 200);
                }
                // Nếu chưa like, thì thêm like mới
                var newLike = new CommentLike(userId, request.CommentId);
                await _unitOfWork.CommentLikeRepository.AddAsync(newLike);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Bạn đã thích bình luận!", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<bool>(ex.Message, 500);
            } 
        }
    }
}
