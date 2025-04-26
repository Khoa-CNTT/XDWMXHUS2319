using Application.CQRS.Queries.Friends;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetSentRequestsWithCursorQueryHandler : IRequestHandler<GetSentRequestsWithCursorQuery, ResponseModel<FriendsListWithCursorDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        public GetSentRequestsWithCursorQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }

        public async Task<ResponseModel<FriendsListWithCursorDto>> Handle(GetSentRequestsWithCursorQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();
            var fetchCount = request.PageSize + 1;

            var requests = await _unitOfWork.FriendshipRepository
                .GetSentRequestsCursorAsync(userId, request.Cursor, fetchCount, cancellationToken);

            if (!requests.Any())
                return ResponseFactory.Success<FriendsListWithCursorDto>("Không có lời mời kết bạn đi", 200);

            if (request.Cursor.HasValue)
            {
                requests = requests.Where(f => f.CreatedAt < request.Cursor.Value).ToList();
            }

            bool hasMore = requests.Count > request.PageSize;
            if (hasMore)
                requests = requests.Take(request.PageSize).ToList();

            var userIds = requests.Select(f => f.FriendId).Distinct().ToList();
            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(userIds);

            var result = requests.Select(f =>
            {
                var user = users.FirstOrDefault(u => u.Id == f.FriendId);
                return user != null ? Mapping.MapToFriendDto(f, user, userId) : null;
            }).Where(x => x != null).Select(x => x!).ToList();

            return ResponseFactory.Success(new FriendsListWithCursorDto
            {
                Friends = result,
                NextCursor = hasMore ? result.Last().CreatedAt : null
            }, "Lấy danh sách lời mời kết bạn đi thành công", 200);
        }
    }
}
