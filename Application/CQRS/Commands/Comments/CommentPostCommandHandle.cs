using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Application.Services;
using Domain.Entities;
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
        private readonly IPostService _postService;
        public CommentPostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, INotificationService notificationService, IPublisher publisher, IPostService postService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _notificationService = notificationService;
            _publisher = publisher;
            _postService = postService;
        }
        public async Task<ResponseModel<ResultCommentDto>> Handle(CommentPostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            if (post == null)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Không tìm thấy bài viết này", 404);
            }
            var postOwnerId = await _postService.GetPostOwnerId(post.Id);

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
                // 🔥 Publish sự kiện bình luận để gửi thông báo qua SignalR
                if (post.UserId != userId)
                {
                    var notification = new Notification(postOwnerId, userId, $"{user.FullName} đã bình luận bài viết của bạn.", NotificationType.PostCommented, null, $"/post/{post.Id}");
                    await _unitOfWork.NotificationRepository.AddAsync(notification);
                    await _notificationService.SendCommentNotificationAsync(request.PostId, userId, postOwnerId, notification.Id);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
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
