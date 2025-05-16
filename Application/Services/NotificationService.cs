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
                var htmlMessage = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .alert-header {{ background-color: #ff9800; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ padding: 20px; background-color: #fff8e1; border: 1px solid #ffecb3; border-radius: 0 0 5px 5px; }}
        .footer {{ margin-top: 20px; font-size: 12px; color: #777; text-align: center; }}
    </style>
</head>
<body>
    <div class='alert-header'>
        <h2>CẢNH BÁO HỆ THỐNG</h2>
    </div>
    <div class='content'>
        <p>Xin chào {user.FullName},</p>
        <p>Hệ thống nhận được cảnh báo sau liên quan đến tài khoản của bạn:</p>
        <div style='background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;'>
            {message}
        </div>
        <p>Vui lòng kiểm tra và thực hiện các biện pháp cần thiết.</p>
    </div>
    <div class='footer'>
        <p>Đây là email tự động, vui lòng không trả lời.</p>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(
                    user.Email,
                    "🚨 Cảnh báo GPS - Hành trình của bạn",
                    htmlMessage
                );
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
        public async Task SendNotificationUpdateLocationAsync(Guid driverId, Guid? passengerId, float lat, float lng, string location, bool isEnd, string endLocation)
        {
            if (isEnd)
            {
                var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
                var passenger = passengerId.HasValue ? await _unitOfWork.UserRepository.GetByIdAsync(passengerId.Value) : null;

                if (driver == null || (passengerId.HasValue && passenger == null))
                    return;

                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, location));

                // Gửi email cho tài xế
                if (driver != null && !string.IsNullOrEmpty(driver.Email))
                {
                    var driverHtml = CreateTripEndEmail(
                        driver.FullName,
                        endLocation,
                        "Tài xế",
                        FormatUtcToLocal(DateTime.UtcNow),
                        "Hãy nhắc nhở hành khách đánh giá bạn nhé!",
                        "#4CAF50"
                    );

                    await _emailService.SendEmailAsync(
                        driver.Email,
                        "✅ Chuyến đi đã hoàn thành",
                        driverHtml
                    );
                }

                // Gửi email cho hành khách
                if (passenger != null && !string.IsNullOrEmpty(passenger.Email))
                {
                    var passengerHtml = CreateTripEndEmail(
                        passenger.FullName,
                        endLocation,
                        "Hành khách",
                        FormatUtcToLocal(DateTime.UtcNow),
                        "Bạn có cảm thấy hài lòng về tài xế này không?",
                        "#2196F3"
                    );

                    await _emailService.SendEmailAsync(
                        passenger.Email,
                        "✅ Chuyến đi đã kết thúc",
                        passengerHtml
                    );
                }
            }
            else
            {
                var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
                var passenger = passengerId.HasValue ? await _unitOfWork.UserRepository.GetByIdAsync(passengerId.Value) : null;

                if (driver == null || (passengerId.HasValue && passenger == null))
                    return;

                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, location));
            }
        }

        private string CreateTripEndEmail(string name,string location, string role, string endTime, string message, string color)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: {color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px; }}
        .info-box {{ background-color: #e8f5e9; padding: 15px; border-left: 4px solid {color}; margin: 15px 0; }}
        .footer {{ margin-top: 20px; font-size: 12px; color: #777; text-align: center; }}
        .rating {{ text-align: center; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>CHUYẾN ĐI ĐÃ KẾT THÚC</h2>
    </div>
    <div class='content'>
        <p>Xin chào {name},</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi với vai trò {role}.</p>
        
        <div class='info-box'>
            <p><strong>Thời gian kết thúc:</strong> {endTime}</p>
            <p><strong>Địa điểm kết thúc:</strong> {location}</p>
        </div>
        
        <div class='rating'>
            <p>{message}</p>
        </div>
        
        <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
    </div>
    <div class='footer'>
        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email sharingsystem@gmail.com</p>
    </div>
</body>
</html>";
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
