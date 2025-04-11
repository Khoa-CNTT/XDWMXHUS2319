using Application.DTOs.FriendShips;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetFriendsListQueryHandle : IRequestHandler<GetFriendsListQuery, ResponseModel<List<FriendDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        public GetFriendsListQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }
        public async Task<ResponseModel<List<FriendDto>>> Handle(GetFriendsListQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();

            var friendships = await _unitOfWork.FriendshipRepository.GetFriendsAsync(userId);

            if (friendships == null || !friendships.Any())
                return ResponseFactory.Success(new List<FriendDto>(), "Không có bạn bè nào",200);

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

            return ResponseFactory.Success(result, "Lấy danh sách bạn bè thành công", 200);
        }
    }
}
