using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUsetByIdQuery, ResponseModel<UserResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserService _userService;
        public GetUserByIdQueryHandler(IUnitOfWork unitOfWork, IUserService userService)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
        }
        public async Task<ResponseModel<UserResponseDto>> Handle(GetUsetByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(request.Id);
            if (user == null)
            {
                return ResponseFactory.Fail<UserResponseDto>("User not found");
            }
            return ResponseFactory.Success(_userService.MapUserToUserResponseDto(user), "Get user by id success");

        }
    }
}
