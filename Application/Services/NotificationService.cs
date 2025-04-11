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

        public async Task SendAcceptFriendNotificationAsync(Guid friendId, Guid userId)
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
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{userId}"
            };

            await _publisher.Publish(new AnswerFriendEvent(friendId, data));
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

        public async Task SendCommentNotificationAsync(Guid postId, Guid commenterId)
        {
            var postOwnerId = await _postService.GetPostOwnerId(postId);
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
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{commenterId}"
            };
            await _publisher.Publish(new CommentEvent(postOwnerId, data));
        }

        public async Task SendFriendNotificationAsync(Guid friendId, Guid userId)
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
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{userId}"
            };

            await _publisher.Publish(new SendFriendEvent(friendId, data));
        }

        public async Task SendInAppNotificationAsync(Guid driverId, string message)
        {

            await _publisher.Publish(new SendInAppNotificationEvent(driverId,message));
        }

        public async Task SendLikeNotificationAsync(Guid postId, Guid userId)
        {
            var name = _userContextService.FullName();
            bool status = await _unitOfWork.LikeRepository.CheckLike(postId, userId);
            var ownerId = await _postService.GetPostOwnerId(postId);
            Task.Delay(2000).Wait();
            if (!status)
            {
                await _publisher.Publish(new LikeEvent(postId, ownerId, $"{name} đã thích bài đăng của bạn vào lúc {FormatUtcToLocal(DateTime.UtcNow)}"));
            }
            else
            {
                await _publisher.Publish(new LikeEvent(postId, ownerId, $"{name} đã bỏ thích bài đăng của bạn vào lúc {FormatUtcToLocal(DateTime.UtcNow)}"));
            }

        }

        public async Task SendNotificationNewMessageAsync(Guid conversationId, Guid receiverId, string content, Guid messageId)
        {
            try
            {
                const int maxLength = 40;
                string truncatedContent = content.Length > maxLength ? content.Substring(0, maxLength) + "..." : content;

                var conversation = await _unitOfWork.ConversationRepository.GetByIdAsync(conversationId);
                if (conversation == null) return;

                var senderId = conversation.User1Id == receiverId ? conversation.User2Id : conversation.User1Id;
                var receiver = await _unitOfWork.UserRepository.GetByIdAsync(receiverId);
                if (receiver == null) return;

                var senderName = await _unitOfWork.UserRepository.GetFullNameByIdAsync(senderId);
                string message = $"{senderName} đã gửi cho bạn một tin nhắn: {truncatedContent}";
                await _publisher.Publish(new SendMessageNotificationEvent( messageId,senderId, receiverId, message));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending notification: {ex.Message}");
            }
        }
        public async Task SendNotificationUpdateLocationAsync(Guid driverId, Guid passengerId, float lat, float lng, string location, bool isEnd)
        {
            var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
            var passenger = await _unitOfWork.UserRepository.GetByIdAsync(passengerId);
            if (driver == null || passenger == null) return;

            if (isEnd)
            {
                string endMessage = $"Chuyến đi đã kết thúc tại: {location}";
                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, endMessage));
                //await _signalRNotificationService.SendNotificationUpdateLocationSignalR(driverId, passengerId, endMessage); // Gọi SignalR
                await _emailService.SendEmailAsync(
                    driver.Email,
                    "Thông báo!!",
                    $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Hãy nhắc nhở hành khách đánh giá bạn nhé!!"
                );
                await _emailService.SendEmailAsync(
                    passenger.Email,
                    "Thông báo!!",
                    $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Bạn có cảm thấy hài lòng về tài xế này không??"
                );
            }
            else
            {
                string locationMessage = $"Bạn đang ở: {location}";
                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, locationMessage));
                //await _signalRNotificationService.SendNotificationUpdateLocationSignalR(driverId, passengerId, locationMessage); // Gọi SignalR
            }
        }

        public async Task SendRejectFriendNotificationAsync(Guid friendId, Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null || friendId == userId) return;

            string? avatar = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                avatar = $"{Constaint.baseUrl}{user.ProfilePicture}";
            }

            var message = $"{user.FullName} đã từ chối lời mời kết bạn";

            var data = new ResponseNotificationModel
            {
                Message = message,
                Avatar = avatar ?? "",
                Url = $"/profile/{userId}"
            };

            await _publisher.Publish(new AnswerFriendEvent(friendId, data));
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
                var commentData = new ResponseNotificationModel
                {
                    Message = commentMsg,
                    Avatar = avatar ?? "",
                    Url = $"/profile/{responderId}"
                };
                await _publisher.Publish(new ReplyCommentEvent(commentOwnerId, commentData));
            }

            // Thông báo cho chủ bài viết nếu khác người bình luận và người phản hồi
            if (postOwnerId != commentOwnerId && postOwnerId != responderId)
            {
                var postMsg = $"{user.FullName} đã phản hồi bình luận vào bài viết của bạn";
                var postData = new ResponseNotificationModel
                {
                    Message = postMsg,
                    Avatar = avatar ?? "",
                    Url = $"/profile/{responderId}"
                };
                await _publisher.Publish(new ReplyCommentEvent(postOwnerId, postData));
            }
        }
        public async Task SendShareNotificationAsync(Guid postId, Guid userId)
        {
            await _publisher.Publish(new ShareEvent(postId, userId));
        }
    }
}
