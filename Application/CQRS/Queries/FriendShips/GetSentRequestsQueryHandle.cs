using Application.DTOs.FriendShips;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetSentRequestsQueryHandle : IRequestHandler<GetSentRequestsQuery, ResponseModel<List<FriendDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContext;
        public GetSentRequestsQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContext)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
        }
        public async Task<ResponseModel<List<FriendDto>>> Handle(GetSentRequestsQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContext.UserId();

            var requests = await _unitOfWork.FriendshipRepository.GetSentRequestsAsync(userId);
            if (!requests.Any())
                return ResponseFactory.Success(new List<FriendDto>(), "Không có lời mời kết bạn đi", 200);

            var userIds = requests.Select(f => f.FriendId).Distinct().ToList(); // Lấy người nhận
            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(userIds);

            var result = requests.Select(f =>
            {
                var user = users.FirstOrDefault(u => u.Id == f.FriendId); // Người nhận
                return user != null ? Mapping.MapToFriendDto(f, user, userId) : null;
            })
            .Select(dto => dto!)
            .ToList();

            return ResponseFactory.Success(result, "Lấy danh sách lời mời kết bạn đi thành công", 200);
        }
    }
}
