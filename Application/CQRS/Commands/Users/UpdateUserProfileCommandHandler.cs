using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, ResponseModel<UserProfileDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public UpdateUserProfileCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return ResponseFactory.Fail<UserProfileDto>("User not found", 404);
            }
            //cap nhat thong tin
            user.UpdateProfile(request.FullName, request.Bio, request.ProfilePicture);
            await _unitOfWork.SaveChangesAsync();
            //tra ve ket qua
            var updatedUserDto = new UserProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Bio = user.Bio,
                ProfilePicture = user.ProfilePicture,
                CreatedAt = user.CreatedAt
            };
            return ResponseFactory.Success(updatedUserDto, "Cập nhật hồ sơ thành công", 200);
        }
    }
}
