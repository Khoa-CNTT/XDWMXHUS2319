using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Application.Model.Events;

using static Domain.Common.Helper;


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

        public async Task SendCommentNotificationAsync(Guid postId, Guid commenterId, string commenterName)
        {
            var postOwnerId = await _postService.GetPostOwnerId(postId);
            if (postOwnerId == commenterId) return;
            await _publisher.Publish(new CommentEvent(postId, postOwnerId, commenterId, $"{commenterName} đã bình luận vào bài viết của bạn"));
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
        public async Task SendNotificationUpdateLocationAsync(Guid driverId,Guid passengerId, double lat, double lng,bool isEnd)
        {
            var driver = await _unitOfWork.UserRepository.GetByIdAsync(driverId);
            var passenger = await _unitOfWork.UserRepository.GetByIdAsync(passengerId);
            if (driver == null || passenger == null) return;
            var location = await _mapService.GetAddressFromCoordinatesAsync(lat,lng);
            if (isEnd)
            {
                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, $"Chuyến đi đã kết thúc tại: {location}"));
                await _emailService.SendEmailAsync(driver.Email, "Thông báo!!", $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Hãy nhắc nhở hành khách đánh giá bạn nhé!!");
                await _emailService.SendEmailAsync(passenger.Email, "Thông báo!!", $"Chuyến đi đã kết thúc!! vào lúc {FormatUtcToLocal(DateTime.UtcNow)} - Bạn có cảm thấy hài lòng về tài xế này không??");
            }
            else
            {
                // 🔥 Đẩy event sang IPublisher
                await _publisher.Publish(new UpdateLocationEvent(driverId, passengerId, $"Bạn đang ở: {location}"));
            }

        }

        public async Task SendReplyNotificationAsync(Guid postId, Guid commentId, Guid responderId, string responderName)
        {
            var commentOwnerId = await _commentService.GetCommentOwnerId(commentId);
            if (commentOwnerId == responderId) return;
            await _publisher.Publish(new CommentEvent(postId, commentOwnerId, responderId, $"{responderName} đã phản hồi bình luận vào bài viết của bạn."));
        }
        public async Task SendShareNotificationAsync(Guid postId, Guid userId)
        {
            await _publisher.Publish(new ShareEvent(postId, userId));
        }
    }
}
