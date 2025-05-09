using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, ResponseModel<bool>>
    {
        private readonly IUserService _userService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        public ChangePasswordCommandHandler(IUnitOfWork unitOfWork, IUserService userService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Get current user
                Guid userId;
                try
                {
                    userId = _userContextService.UserId();
                }
                catch (UnauthorizedAccessException)
                {
                    // Nếu không có người dùng nào được xác thực, trả về lỗi
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not authenticated", 401);
                }
                // Kiểm tra xem người dùng có tồn tại không
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not found", 404);
                }

                // Kiểm tra mật khẩu cũ có đúng không
                bool isOldPasswordValid = await Task.Run(() => BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash));
                if (!isOldPasswordValid)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Incorrect old password", 400);
                }

                // Kiểm tra mật khẩu mới có khớp không
                if (request.NewPassword != request.ConfirmPassword)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("New passwords do not match", 400);
                }
                // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
                var isSamePassword = await _userService.VerifyPasswordAsync(user.PasswordHash, request.NewPassword);
                if (isSamePassword)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("The new password must not be the same as the old password", 400);
                }


                // Update password
                var hashedPassword = await _userService.HashPasswordAsync(request.NewPassword);
                user.UpdatePassword(hashedPassword);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Password changed successfully", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Failed to change password", 400, ex);
            }
        }
    }
}
