using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class CommentPostCommandHandle : IRequestHandler<CommentPostCommand, ResponseModel<ResultCommentDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        private readonly INotificationService _notificationService;
        private readonly IPublisher _publisher;
        public CommentPostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, INotificationService notificationService, IPublisher publisher)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _notificationService = notificationService;
            _publisher = publisher;
        }
        public async Task<ResponseModel<ResultCommentDto>> Handle(CommentPostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            if (post == null)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Không tìm thấy bài viết này", 404);
            }

            // Kiểm tra số lần share của user đối với bài viết này
            var oneMinutesAgo = DateTime.UtcNow.AddMinutes(-1);
            var commentCount = await _unitOfWork.CommentRepository.CountPostCommentAsync(c =>
                c.UserId == userId && c.PostId == request.PostId && c.CreatedAt >= oneMinutesAgo);

            if (commentCount >= 10)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Bạn đã bình luận bài viết này quá số lần cho phép trong thời gian ngắn. Cảnh báo spam!", 403);
            }

            if(request.Content == null)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Nội dung bình luận không được để trống", 400);
            }

            if (!await _geminiService.ValidatePostContentAsync(request.Content))
            {
                return ResponseFactory.Fail<ResultCommentDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {             
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if(user == null)
                {
                    return ResponseFactory.Fail<ResultCommentDto>("Không tìm thấy người dùng này", 404);
                }
                var comment = new Comment(userId, request.PostId, request.Content);

                await _unitOfWork.CommentRepository.AddAsync(comment);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // 🔥 Publish sự kiện bình luận để gửi thông báo qua SignalR
                if (post.UserId != userId)
                {
                    await _notificationService.SendCommentNotificationAsync(request.PostId, userId);
                }
                return ResponseFactory.Success(Mapping.MapToResultCommentPostDto(comment, user.FullName, user.ProfilePicture), "Bình luận bài viết thành công", 200);
            }
            catch(Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResultCommentDto>(ex.Message, 500);
            }
        }
    }
}
