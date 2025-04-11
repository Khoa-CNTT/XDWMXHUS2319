using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, ResponseModel<MaptoUserprofileDetailDto>>
    {
  
        private readonly IUserContextService _userContextService;
        
        private readonly IUnitOfWork _unitOfWork;
        public GetUserProfileQueryHandler(IUserContextService userContextService, IUnitOfWork unitOfWork)
        {
            _userContextService = userContextService;
            
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<MaptoUserprofileDetailDto>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId(); // Lấy UserId tại đây
            if (userId == Guid.Empty)
            {
                return ResponseFactory.Fail<MaptoUserprofileDetailDto>("Unauthorized", 401);
            }

            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return ResponseFactory.Fail<MaptoUserprofileDetailDto>("User not found", 404);
            }

            return ResponseFactory.Success(Mapping.MaptoUserprofileDto(user), "Get user profile success", 200);
        }
    }
}
