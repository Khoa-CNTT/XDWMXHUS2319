using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public UpdateUserProfileCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<bool>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return ResponseFactory.Fail<bool>("User not found", 404);
            }
            user.UpdateProfile(request.FullName, request.Bio, request.ProfilePicture);
            await _unitOfWork.SaveChangesAsync();
            return ResponseFactory.Success(true, "Update user profile successfully", 200);
        }
    }
}
