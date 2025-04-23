using Application.DTOs.Comments;
using Application.DTOs.Post;
using Application.DTOs.Shares;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Shares
{
    public class SharePostCommandHandle : IRequestHandler<SharePostCommand, ResponseModel<ResultSharePostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        private readonly IPostService _postService;
        private readonly INotificationService _notificationService;
        public SharePostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, IPostService postService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _postService = postService;
            _notificationService = notificationService;
        }
        public async Task<ResponseModel<ResultSharePostDto>> Handle(SharePostCommand request, CancellationToken cancellationToken)
        {
            // Lấy UserId từ UserContextService
            var userId = _userContextService.UserId();
            // Lấy bài Post gốc
            var originalPost = await _unitOfWork.PostRepository.GetByIdOriginalPostAsync(request.PostId);
            if (originalPost == null)
            {
                return ResponseFactory.Fail<ResultSharePostDto>("Không tìm thấy bài viết để chia sẻ", 404);
            }
            //var isSpamming = await _postService.IsUserSpammingSharesAsync(userId, request.PostId);
            //if (isSpamming)
            //{
            //    return ResponseFactory.Fail<ResultSharePostDto>("Bạn đã chia sẻ bài viết này quá số lần cho phép trong thời gian ngắn. Cảnh báo spam!", 403);
            //}
            // Lấy thông tin người dùng chia sẻ
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ResponseFactory.Fail<ResultSharePostDto>("Không tìm thấy người dùng", 404);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // **Tạo bài Share**
                var share = new Share(userId, request.PostId, request.Content);
                await _unitOfWork.ShareRepository.AddAsync(share);

                // **Tạo bài Post mới có IsSharedPost = true**
                var sharedPost = Post.CreateShare(userId, originalPost, request.Content ?? "");
                // Kiểm tra nội dung bài viết có chứa từ ngữ không chấp nhận
                if (!await _geminiService.ValidatePostContentAsync(sharedPost.Content))
                {
                    sharedPost.RejectAI();
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<ResultSharePostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                sharedPost.ApproveAI();
                sharedPost.IsShare();
                await _unitOfWork.PostRepository.AddAsync(sharedPost);
                var postOwnerId = await _postService.GetPostOwnerId(originalPost.Id);
                //Lưu vào Notification
                var notification = new Notification(postOwnerId, userId, $"{user.FullName} đã chia sẻ bài viết của bạn", NotificationType.PostShared, null, $"/post/{originalPost.Id}");
                await _unitOfWork.NotificationRepository.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                if(userId != originalPost.UserId)
                {
                    await _notificationService.SendShareNotificationAsync(request.PostId, userId, postOwnerId, notification.Id);
                }
                
                return ResponseFactory.Success(
                    Mapping.MapToResultSharePostDto(sharedPost, originalPost, user), // ⚠️ Truyền `share` thay vì `sharedPost`
                    "Chia sẻ bài viết thành công",
                    200
                );
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<ResultSharePostDto>("Lỗi trong quá trình chia sẻ", 500, ex);
            }
        }
    }
}
