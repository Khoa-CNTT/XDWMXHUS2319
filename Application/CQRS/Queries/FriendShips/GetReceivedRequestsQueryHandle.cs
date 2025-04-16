using Application.DTOs.FriendShips;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetReceivedRequestsQueryHandle : IRequestHandler<GetReceivedRequestsQuery, ResponseModel<List<FriendDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public GetReceivedRequestsQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<List<FriendDto>>> Handle(GetReceivedRequestsQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var requests = await _unitOfWork.FriendshipRepository.GetReceivedRequestsAsync(userId);
            if (!requests.Any())
                return ResponseFactory.Success(new List<FriendDto>(), "Không có lời mời kết bạn đến", 200);

            var userIds = requests.Select(f => f.UserId).Distinct().ToList();
            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(userIds);

            var result = requests.Select(f =>
            {
                var user = users.FirstOrDefault(u => u.Id == f.UserId);
                return user != null ? Mapping.MapToFriendDto(f, user, userId) : null;
            })
                .Select(dto => dto!)
                .ToList();

            return ResponseFactory.Success(result, "Lấy danh sách lời mời kết bạn đến thành công", 200);
        }
    }
}
