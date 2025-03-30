using Application.Interface;
using Application.Interface.Hubs;
using Application.Services;
using Infrastructure.Email;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Service
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IPostService _postService;
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly ICommentService _commentService;

        public SignalRNotificationService(IHubContext<NotificationHub> hubContext,
            IPostService postService,
            IUserService userService,
            IEmailService emailService,
            ICommentService commentService)
        {
            _hubContext = hubContext;
            _postService = postService;
            _userService = userService;
            _emailService = emailService;
            _commentService = commentService;
        }

        /// <summary>
        /// Gửi cảnh báo khẩn cấp đến tài xế qua thông báo ứng dụng và email (nếu cần)
        /// </summary>
        public async Task SendAlertAsync(Guid driverId, string message)
        {
            var user = await _userService.GetByIdAsync(driverId);
            if (user == null) return;

            // Gửi thông báo qua SignalR
            await _hubContext.Clients.User(driverId.ToString())
                .SendAsync("ReceiveAlert", message);

            // Gửi email cảnh báo nếu cần (giả định có EmailService)
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendEmailAsync(user.Email, "Cảnh báo GPS", message);
            }
        }

        public async Task SendCommentNotificationAsync(Guid postId, Guid commenterId, string commenterName)
        {
            var postOwnerId = await _postService.GetPostOwnerId(postId);
            if (postOwnerId == commenterId) return; // Không gửi nếu chủ bài viết tự bình luận

            string message = $"{commenterName} đã bình luận vào bài viết của bạn.";
            await _hubContext.Clients.User(postOwnerId.ToString()).SendAsync("ReceiveNotification", message);
        }

        /// <summary>
        /// Gửi thông báo trong ứng dụng (không khẩn cấp)
        /// </summary>
        public async Task SendInAppNotificationAsync(Guid driverId, string message)
        {
            var user = await _userService.GetByIdAsync(driverId);
            if (user == null) return;

            // Gửi thông báo qua SignalR
            await _hubContext.Clients.User(driverId.ToString())
                .SendAsync("ReceiveNotification", message);
        }

        public async Task SendLikeNotificationAsync(Guid postId, Guid userId)
        {
            var ownerId = await _postService.GetPostOwnerId(postId);
            var userName = await _userService.GetByIdAsync(userId);
            if (userName == null) return;
            await _hubContext.Clients.Group(ownerId.ToString())
                .SendAsync("ReceiveNotification", $"User {userName.FullName} liked your post.");
        }
        public async Task SendNotificationWhenTripEnds(Guid driverId, Guid passengerId, string message)
        {
            await _hubContext.Clients.User(driverId.ToString())
                .SendAsync("ReceiveNotification",message);

            await _hubContext.Clients.User(passengerId.ToString())
                .SendAsync("ReceiveNotification", message);
        }

        public async Task SendReplyNotificationAsync(Guid commentId, Guid responderId, string responderName)
        {
            var commentOwnerId = await _commentService.GetCommentOwnerId(commentId);
            if(commentOwnerId == responderId) return;
            string message = $"{responderName} đã bình luận vào bài viết của bạn.";
            await _hubContext.Clients.User(commentOwnerId.ToString()).SendAsync("ReceiveNotification", message);
        }
        public async Task SendShareNotificationAsync(Guid postId, Guid userId)
        {
            var ownerId = await _postService.GetPostOwnerId(postId);
            var user = await _userService.GetByIdAsync(userId);

            if (user == null || ownerId == Guid.Empty) return;

            string message = $"{user.FullName} đã chia sẻ bài viết của bạn.";

            await _hubContext.Clients.User(ownerId.ToString())
                .SendAsync("ReceiveNotification", message);
        }
    }
}
