using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserProfileDetailQueryHandle : IRequestHandler<GetUserProfileDetailQuery, ResponseModel<UserProfileDetailDto>>
    {
        private readonly IUserContextService _userContextService;

        private readonly IUnitOfWork _unitOfWork;
        public GetUserProfileDetailQueryHandle(IUserContextService userContextService, IUnitOfWork unitOfWork)
        {
            _userContextService = userContextService;

            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<UserProfileDetailDto>> Handle(GetUserProfileDetailQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId(); // Lấy UserId tại đây
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<UserProfileDetailDto>("Unauthorized", 401);
            }

            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return ResponseFactory.Fail<UserProfileDetailDto>("User not found", 404);
            }

            return ResponseFactory.Success(Mapping.MaptoUserprofileDetailDto(user), "Get user profile success", 200);
        }
    }
}
