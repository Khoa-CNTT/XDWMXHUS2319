using Application.DTOs.FriendShips;
using Application.Interface.ContextSerivce;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetFriendsListQueryHandle : IRequestHandler<GetFriendsListQuery, ResponseModel<FriendsListWithCountDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        private readonly IRedisService _redisService;
        public GetFriendsListQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContext, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _redisService = redisService;
        }
        public async Task<ResponseModel<FriendsListWithCountDto>> Handle(GetFriendsListQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();
           
                var friends = await _redisService.GetFriendsAsync(userId.ToString());
                if (!friends.Any())
                {
                    await _redisService.SyncFriendsToRedis(userId.ToString());
                    friends = await _redisService.GetFriendsAsync(userId.ToString());
                }
           

            var friendships = await _unitOfWork.FriendshipRepository.GetFriendsAsync(userId);

            if (friendships == null || !friendships.Any())
            {
                var emptyResult = new FriendsListWithCountDto
                {
                    CountFriend = 0,
                    Friends = new List<FriendDto>()
                };
                return ResponseFactory.Success(emptyResult, "Không có bạn bè nào", 200);
            }

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
             .Select(dto => dto!) // ép kiểu non-null
             .ToList();

            var response = new FriendsListWithCountDto
            {
                CountFriend = result.Count,
                Friends = result
            };

            return ResponseFactory.Success(response, "Lấy danh sách bạn bè thành công", 200);
        }
    }
}
