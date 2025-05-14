namespace Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPostService _postService;
        private readonly IPublisher _publisher;  // 🔥 Dùng Event Bus để publish event
        private readonly IUserContextService _userContextService;
        private readonly IMapService _mapService;
        private readonly IEmailService _emailService;
        private readonly ICommentService _commentService;
        public NotificationService( IUnitOfWork unitOfWork,IPublisher publisher,
            IUserContextService userContextService, IEmailService emailService,
            IPostService postService,IMapService mapService, ICommentService commentService)

        {
            _unitOfWork = unitOfWork;
            _publisher = publisher;

            _emailService = emailService;
            _userContextService = userContextService;
            _postService = postService;
            _mapService = mapService;
            _commentService = commentService;
        }

        public async Task SendAcceptFriendNotificationAsync(Guid friendId, Guid userId, Guid notificationId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null || friendId == userId) return;

            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }
            var message = $"{user.FullName} đã chấp nhận lời mời kết bạn";

            var data = new ResponseNotificationModel
            {
                NotificationId = notificationId,
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{userId}",
                SenderId = userId,
                CreatedAt = FormatUtcToLocal(DateTime.UtcNow)
            };

            await _publisher.Publish(new AnswerFriendEvent(friendId, data));
        }

        public async Task SendAcceptRideNotificationAsync(Guid passengerId, Guid userId, Guid notificationId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null || passengerId == userId) return;

            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }
            var message = $"{user.FullName} đã chấp nhận chuyến đi với bạn";

            var data = new ResponseNotificationModel
            {
                NotificationId = notificationId,
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/your-ride",
                SenderId = userId,
                CreatedAt = FormatUtcToLocal(DateTime.UtcNow)
            };

            await _publisher.Publish(new AcceptRideEvent(passengerId, data));
        }

        public async Task SendAlertAsync(Guid driverId, string message)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
            if (user == null) return;
            await _publisher.Publish(new SendInAppNotificationEvent(driverId, message));
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendEmailAsync(user.Email, "Cảnh báo GPS", message);
            }
        }

        public async Task SendCommentNotificationAsync(Guid postId, Guid commenterId, Guid postOwnerId, Guid notificationId)
        {
            if (postOwnerId == commenterId) return;
            var user = await _unitOfWork.UserRepository.GetByIdAsync(commenterId);
            if (user == null) return;
            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }

            var message = $"{user.FullName} đã bình luận vào bài viết của bạn";
            var data = new ResponseNotificationModel
            {
                NotificationId = notificationId,
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{commenterId}",
                SenderId = commenterId,
                CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
            };
            await _publisher.Publish(new CommentEvent(postOwnerId, data));
        }

        public async Task SendFriendNotificationAsync(Guid friendId, Guid userId, Guid notificationId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null || friendId == userId) return;

            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }

            var message = $"{user.FullName} đã gửi lời mời kết bạn";

            var data = new ResponseNotificationModel
            {
                NotificationId = notificationId,
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{userId}",
                SenderId = userId,
                CreatedAt = FormatUtcToLocal(DateTime.UtcNow)
            };

            await _publisher.Publish(new SendFriendEvent(friendId, data));
        }

        public async Task SendInAppNotificationAsync(Guid driverId, string message)
        {

            await _publisher.Publish(new SendInAppNotificationEvent(driverId,message));
        }

        public async Task SendLikeComentNotificationAsync(Guid postId, Guid commentId, Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            bool status = await _unitOfWork.CommentLikeRepository.CheckLikeComment(commentId, userId);
            var commentOwnerId = await _commentService.GetCommentOwnerId(commentId);
            if (user == null || commentOwnerId == userId) return;
            //Lưu vào notification
            var message = $"{user.FullName} đã thích bình luận của bạn";

            //Phat su kien vao likeEvent
            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }
            Task.Delay(2000).Wait();
            if (!status)
            {
                var notification = new Notification(commentOwnerId, userId, message, NotificationType.LikeComment, null, $"/post/{postId}");
                await _unitOfWork.NotificationRepository.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
                var data = new ResponseNotificationModel
                {
                    NotificationId = notification.Id,
                    Message = message,
                    Avatar = avatar ?? "",
                    Url = $"/post/{postId}",
                    CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                    SenderId = userId,
                };
                await _publisher.Publish(new LikeCommentEvent(commentOwnerId, data));
            }
        }
        public async Task SendLikeNotificationAsync(Guid postId, Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            bool status = await _unitOfWork.LikeRepository.CheckLike(postId, userId);
            var ownerId = await _postService.GetPostOwnerId(postId);
            if (user == null || ownerId == userId) return;
            //Lưu vào notification
            var message = $"{user.FullName} đã thích bài đăng của bạn";
           
            //Phat su kien vao likeEvent
            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }
            Task.Delay(2000).Wait();
            if (!status)
            {
                var notification = new Notification(ownerId, userId, $"{user.FullName} đã thích bài đăng của bạn", NotificationType.PostLiked, null, $"/post/{postId}");
                await _unitOfWork.NotificationRepository.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
                var data = new ResponseNotificationModel
                {
                    NotificationId = notification.Id,
                    Message = message,
                    Avatar = avatar ?? "",
                    Url = $"/post/{postId}",
                    CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                    SenderId = userId,
                };
                await _publisher.Publish(new LikeEvent(ownerId, data));

            }
            //else
            //{
            //    await _publisher.Publish(new LikeEvent(postId, ownerId, $"{name} đã bỏ thích bài đăng của bạn vào lúc {FormatUtcToLocal(DateTime.UtcNow)}"));
            //}
        }

        public async Task SendNotificationMessageWithIsSeenFalse(Guid conversationId,Guid receiverId)
        {
            int total = await _unitOfWork.MessageRepository.GetUnreadMessageCountAsync(conversationId,receiverId);
            if (total == 0) return;
            await _publisher.Publish(new SendNotificationMessageWithIsSeenFalseEvent(receiverId,total));
        }

        public async Task SendNotificationNewMessageAsync(Guid receiverId, string message)
        {
                await _publisher.Publish(new SendMessageNotificationEvent(receiverId, message));
        }
        public async Task SendNotificationUpdateLocationAsync(Guid driverId, Guid? passengerId, float lat, float lng, string location, bool isEnd)
        {
            // Khi chuyến đi kết thúc, gửi thông báo và email cho cả hai
            if (isEnd)
            {
                var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
                var passenger = passengerId.HasValue ? await _unitOfWork.UserRepository.GetByIdAsync(passengerId.Value) : null;

                if (driver == null || (passengerId.HasValue && passenger == null))
                    return;

                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, location));

                // Gửi email cho tài xế
                if (driver != null)
                {
                    await _emailService.SendEmailAsync(
                        driver.Email,
                        "Thông báo!!",
                        $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Hãy nhắc nhở hành khách đánh giá bạn nhé!!"
                    );
                }

                // Gửi email cho hành khách
                if (passenger != null)
                {
                    await _emailService.SendEmailAsync(
                        passenger.Email,
                        "Thông báo!!",
                        $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Bạn có cảm thấy hài lòng về tài xế này không??"
                    );
                }
            }
            // Khi cập nhật vị trí, gửi thông báo đến cả tài xế và hành khách
            else
            {
                var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
                var passenger = passengerId.HasValue ? await _unitOfWork.UserRepository.GetByIdAsync(passengerId.Value) : null;

                if (driver == null || (passengerId.HasValue && passenger == null))
                    return;

                // Gửi thông báo đến cả tài xế và hành khách
                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, location));
            }
        }
        public async Task SendReplyNotificationAsync(Guid postId, Guid commentId, Guid responderId)
        {
            var postOwnerId = await _postService.GetPostOwnerId(postId);
            var commentOwnerId = await _commentService.GetCommentOwnerId(commentId);
            if (commentOwnerId == responderId) return;

            var user = await _unitOfWork.UserRepository.GetByIdAsync(responderId);
            if (user == null) return;

            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }

            // Thông báo cho chủ bình luận
            if (commentOwnerId != responderId)
            {
                var commentMsg = $"{user.FullName} đã phản hồi bình luận của bạn";
                var notification1 = new Notification(commentOwnerId, responderId, commentMsg, NotificationType.ReplyComment, null, $"/post/{postId}");
                await _unitOfWork.NotificationRepository.AddAsync(notification1);
                var commentData = new ResponseNotificationModel
                {
                    NotificationId = notification1.Id,
                    Message = commentMsg,
                    Avatar = avatar ?? "",
                    Url = $"/profile/{responderId}",
                    CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                    SenderId = responderId,
                };

                await _publisher.Publish(new ReplyCommentEvent(commentOwnerId, commentData));
            }

            // Thông báo cho chủ bài viết nếu khác người bình luận và người phản hồi
            if (postOwnerId != commentOwnerId && postOwnerId != responderId)
            {
                var postMsg = $"{user.FullName} đã phản hồi bình luận vào bài viết của bạn";
                var notification2 = new Notification(postOwnerId, responderId, postMsg, NotificationType.ReplyComment, null, $"/post/{postId}");
                await _unitOfWork.NotificationRepository.AddAsync(notification2);
                var postData = new ResponseNotificationModel
                {
                    NotificationId = notification2.Id,
                    Message = postMsg,
                    Avatar = avatar ?? "",
                    Url = $"/profile/{responderId}",
                    CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                    SenderId = responderId,
                };

                await _publisher.Publish(new ReplyCommentEvent(postOwnerId, postData));
            }
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task SendReportNotificationToAdmins(Guid reporterId, Guid postId, string reason, string reporterName)
        {
            var admins = await _unitOfWork.UserRepository.GetAdminsAsync();
            if (admins == null || !admins.Any()) return;

            // Lấy thông tin người report
            var reporter = await _unitOfWork.UserRepository.GetByIdAsync(reporterId);
            string avatar = !string.IsNullOrEmpty(reporter?.ProfilePicture)
            ? $"{Constaint.baseUrl}{reporter.ProfilePicture}": "";


            var message = $"{reporterName} đã báo cáo bài viết {postId}. Lý do: {reason}";

            foreach (var admin in admins)
            {
                if (admin.Id == reporterId) continue; // Bỏ qua nếu admin tự report

                var notification = new Notification(
                    admin.Id,
                    reporterId,
                    message,
                    NotificationType.ReportPost,
                    null,
                    $"/admin/userreport" // URL đến trang quản lý report
                );

                await _unitOfWork.NotificationRepository.AddAsync(notification);

                var data = new ResponseNotificationModel
                {
                    NotificationId = notification.Id,
                    Message = message,
                    Avatar = avatar ?? "",
                    Url = $"/admin/userreport",
                    CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                    SenderId = reporterId,
                };

                await _publisher.Publish(new AdminNotificationEvent(admin.Id, data));
            }
        }

        public async Task SendShareNotificationAsync(Guid postId, Guid userId, Guid postOwnerId, Guid notificationId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            if (user == null|| postOwnerId == Guid.Empty) return;
            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }

            var message = $"{user.FullName} đã chia sẻ bài viết của bạn";

            var data = new ResponseNotificationModel
            {
                NotificationId = notificationId,
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/post/{postId}",
                CreatedAt = FormatUtcToLocal(DateTime.UtcNow),
                SenderId = userId,
            };
            await _publisher.Publish(new ShareEvent(postOwnerId, data));

        }

    }
}
