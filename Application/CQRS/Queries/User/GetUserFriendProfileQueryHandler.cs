using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserFriendProfileQueryHandler : IRequestHandler<GetUserFriendProfileQuery, ResponseModel<MaptoUserprofileDetailDto>>
    {
        private readonly IUserContextService _userContextService;

        private readonly IUnitOfWork _unitOfWork;
        public GetUserFriendProfileQueryHandler(IUserContextService userContextService, IUnitOfWork unitOfWork)
        {
            _userContextService = userContextService;

            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<MaptoUserprofileDetailDto>> Handle(GetUserFriendProfileQuery request, CancellationToken cancellationToken)
        {

            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                return ResponseFactory.Fail<MaptoUserprofileDetailDto>("User not found", 404);
            }

            return ResponseFactory.Success(Mapping.MaptoUserprofileDto(user), "Get user profile success", 200);
        }
    }
}
