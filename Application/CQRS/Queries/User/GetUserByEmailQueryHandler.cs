using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserByEmailQueryHandler : IRequestHandler<GetUsetByEmailQuery, ResponseModel<UserResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserService _userService;
        public GetUserByEmailQueryHandler(IUnitOfWork unitOfWork, IUserService userService)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
        }
        public async Task<ResponseModel<UserResponseDto>> Handle(GetUsetByEmailQuery request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(request.Id);
            if (user == null)
            {
                return ResponseFactory.Fail<UserResponseDto>("User not found",404);
            }
            return ResponseFactory.Success(_userService.MapUserToUserResponseDto(user), "Get user by id success",200);

        }
    }
}
