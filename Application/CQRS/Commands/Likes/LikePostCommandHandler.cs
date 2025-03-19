using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Application.Model.Events;


namespace Application.CQRS.Commands.Likes
{
    public class LikePostCommandHandler : IRequestHandler<LikePostCommand, ResponseModel<bool>>
    {
        private readonly IRedisService _redisService;
        private readonly INotificationService _notificationService;
        private readonly IUserContextService _userContextService;
        private readonly IPublisher _publisher;

        public LikePostCommandHandler(IRedisService redisService, 
            INotificationService notificationService, 
            IUserContextService userContextService,
            IPublisher publisher)
        {
            _redisService = redisService;
            _notificationService = notificationService;
            _userContextService = userContextService;
            _publisher = publisher;
        }

        public async Task<ResponseModel<bool>> Handle(LikePostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            // 🛑 Kiểm tra request hợp lệ
            if (request.PostId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("PostId là bắt buộc", 400);
            }

            // 📌 Lưu vào Redis trước, worker sẽ xử lý sau
            string redisKey = "like_events";

            var likeEvent = new LikeEvent(request.PostId, userId);
            bool isAdded = await _redisService.AddAsync(redisKey, likeEvent, TimeSpan.FromMinutes(10));

            if (isAdded)
            {
                 await _publisher.Publish(likeEvent);
                return ResponseFactory.Success<bool>("Like/unlike request đã được lưu, sẽ xử lý sau", 202);
            }

            return ResponseFactory.Fail<bool>("Không thể lưu like vào Redis", 500);
        }


    }
}

