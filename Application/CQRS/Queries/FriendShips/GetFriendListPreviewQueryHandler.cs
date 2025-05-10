using Application.CQRS.Queries.Friends;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    internal class GetFriendListPreviewQueryHandler : IRequestHandler<GetFriendListPreviewQuery, ResponseModel<List<FriendDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly IRedisService _redisService;
        public GetFriendListPreviewQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _redisService = redisService;
        }
        public async Task<ResponseModel<List<FriendDto>>> Handle(GetFriendListPreviewQuery request, CancellationToken cancellationToken)
        {
            const int previewTake = 5;

            // Redis sync (giữ nguyên để đảm bảo cache)
            var friends = await _redisService.GetFriendsAsync(request.UserId.ToString());
            if (!friends.Any())
            {
                await _redisService.SyncFriendsToRedis(request.UserId.ToString());
                friends = await _redisService.GetFriendsAsync(request.UserId.ToString());
            }

            var friendships = await _unitOfWork.FriendshipRepository
                .GetFriendsPreviewAsync(request.UserId, previewTake, cancellationToken);

            if (friendships == null || !friendships.Any())
            {
                return ResponseFactory.Success(new List<FriendDto>(), "Không có bạn bè nào", 200);
            }

            var friendIds = friendships
                .Select(f => f.UserId == request.UserId ? f.FriendId : f.UserId)
                .Distinct()
                .ToList();

            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(friendIds);

            var result = friendships
                .Select(f =>
                {
                    var otherUserId = f.UserId == request.UserId ? f.FriendId : f.UserId;
                    var user = users.FirstOrDefault(u => u.Id == otherUserId);
                    return user != null ? Mapping.MapToFriendDto(f, user, request.UserId) : null;
                })
                .Where(dto => dto != null)
                .Select(dto => dto!)
                .ToList();

            return ResponseFactory.Success(result, "Lấy danh sách bạn bè xem trước thành công", 200);
        }
    }
}
