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
    

        public LikePostCommandHandler(IRedisService redisService, 
            INotificationService notificationService, 
            IUserContextService userContextService)
        {
            _redisService = redisService;
            _notificationService = notificationService;
            _userContextService = userContextService;
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
            bool isAdded = await _redisService.AddAsync(redisKey,new Like(userId,request.PostId), TimeSpan.FromMinutes(10));

            if (isAdded)
            {
                await _notificationService.SendLikeNotificationAsync(request.PostId, userId);
                if (request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }
                return ResponseFactory.Success<bool>("Like/unlike request đã được lưu, sẽ xử lý sau", 202);
            }

            return ResponseFactory.Fail<bool>("Không thể lưu like vào Redis", 500);
        }


    }
}

