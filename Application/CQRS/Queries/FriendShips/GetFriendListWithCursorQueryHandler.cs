using Application.CQRS.Queries.Friends;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetFriendListWithCursorQueryHandler : IRequestHandler<GetFriendListWithCursorQuery, ResponseModel<FriendsListWithCursorDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly IRedisService _redisService;
        public GetFriendListWithCursorQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _redisService = redisService;
        }
        public async Task<ResponseModel<FriendsListWithCursorDto>> Handle(GetFriendListWithCursorQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();

            // Redis sync
            var friends = await _redisService.GetFriendsAsync(userId.ToString());
            if (!friends.Any())
            {
                await _redisService.SyncFriendsToRedis(userId.ToString());
                friends = await _redisService.GetFriendsAsync(userId.ToString());
            }

            // Fetch count and friendships
            var fetchCount = request.PageSize + 1; // Fetch one extra to check for more
            var friendships = await _unitOfWork.FriendshipRepository
                .GetFriendsCursorAsync(userId, request.Cursor, fetchCount, cancellationToken);
            var totalFriendCount = await _unitOfWork.FriendshipRepository
                .CountAcceptedFriendsAsync(userId);

            // If no friendships, return empty response
            if (friendships == null || !friendships.Any())
            {
                return ResponseFactory.Success(new FriendsListWithCursorDto
                {
                    CountFriend = 0,
                    Friends = new List<FriendDto>(),
                    NextCursor = null
                }, "Không có bạn bè nào", 200);
            }

            // Determine if there are more items
            bool hasMore = friendships.Count > request.PageSize;
            if (hasMore)
            {
                friendships = friendships.Take(request.PageSize).ToList(); // Trim to PageSize
            }

            // Calculate nextCursor
            DateTime? nextCursor = hasMore ? friendships.Last().CreatedAt : null;

            // Get friend IDs
            var friendIds = friendships
                .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
                .Distinct()
                .ToList();

            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(friendIds);

            var result = friendships
                .Select(f =>
                {
                    var otherUserId = f.UserId == userId ? f.FriendId : f.UserId;
                    var user = users.FirstOrDefault(u => u.Id == otherUserId);
                    return user != null ? Mapping.MapToFriendDto(f, user, userId) : null;
                })
                .Where(dto => dto != null)
                .Select(dto => dto!)
                .ToList();

            var response = new FriendsListWithCursorDto
            {
                CountFriend = totalFriendCount,
                Friends = result,
                NextCursor = nextCursor
            };

            return ResponseFactory.Success(response, "Lấy danh sách bạn bè thành công", 200);
        }
    }
}
