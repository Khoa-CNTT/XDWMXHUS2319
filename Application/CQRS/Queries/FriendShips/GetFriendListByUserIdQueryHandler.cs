using Application.CQRS.Queries.Friends;
using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetFriendListByUserIdQueryHandler : IRequestHandler<GetFriendListByUserIdQuery, ResponseModel<FriendsListWithCursorDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        public GetFriendListByUserIdQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }
        public async Task<ResponseModel<FriendsListWithCursorDto>> Handle(GetFriendListByUserIdQuery request, CancellationToken cancellationToken)
        {

            var friendships = await _unitOfWork.FriendshipRepository.GetFriendsAsync(request.UserId);

            if (friendships == null || !friendships.Any())
            {
                var emptyResult = new FriendsListWithCursorDto
                {
                    CountFriend = 0,
                    Friends = new List<FriendDto>()
                };
                return ResponseFactory.Success(emptyResult, "Không có bạn bè nào", 200);
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
             .Select(dto => dto!) // ép kiểu non-null
             .ToList();

            var response = new FriendsListWithCursorDto
            {
                CountFriend = result.Count,
                Friends = result
            };

            return ResponseFactory.Success(response, "Lấy danh sách bạn bè thành công", 200);
        }
    }
}
