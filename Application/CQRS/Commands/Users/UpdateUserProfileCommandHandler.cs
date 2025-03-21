using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, ResponseModel<UserProfileDto>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        public UpdateUserProfileCommandHandler(IUserRepository userRepository, IUserContextService userContextService, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            // 🔐 Lấy UserId từ Token
            var userIdFromToken = _userContextService.UserId();
            if (userIdFromToken == Guid.Empty)
            {
                return ResponseFactory.Fail<UserProfileDto>("Unauthorized", 401);
            }

            // 🔍 Lấy thông tin người dùng từ Database
            var user = await _userRepository.GetUserByIdAsync(userIdFromToken);
            if (user == null)
            {
                return ResponseFactory.Fail<UserProfileDto>("User not found", 404);
            }

            // 🛑 Ngăn chặn giả mạo UserId
            if (request.UserId != userIdFromToken)
            {
                return ResponseFactory.Fail<UserProfileDto>("Forbidden: You cannot update another user's profile", 403);
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Cập nhật thông tin người dùng
                user.UpdateProfile(request.FullName, request.Bio, request.ProfilePicture);
                await _userRepository.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                // Trả về kết quả sau khi cập nhật
                return ResponseFactory.Success(Mapping.MaptoUserprofileDto(user), "Cập nhật hồ sơ thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UserProfileDto>(ex.Message, 500);
            }
        }
    }
}
