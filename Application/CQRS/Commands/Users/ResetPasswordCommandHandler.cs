using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ResponseModel<bool>>
    {
        private readonly IUserService _userService;
        private readonly IUnitOfWork _unitOfWork;

        public ResetPasswordCommandHandler(IUnitOfWork unitOfWork, IUserService userService)
        {
            _unitOfWork = unitOfWork;
            _userService = userService;
        }

        public async Task<ResponseModel<bool>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Validate inputs
                if (request.NewPassword != request.ConfirmPassword)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Mật khẩu không khớp", 400);
                }

                // Validate token
                var emailToken = await _unitOfWork.EmailTokenRepository.GetByTokenAsync(request.Token);
                if (emailToken == null || emailToken.IsUsed || emailToken.ExpiryDate < DateTime.UtcNow)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Invalid or expired token", 400);
                }

                // Get user
                var user = await _unitOfWork.UserRepository.GetByIdAsync(emailToken.UserId);
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not found", 404);
                }
                // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
                var isSamePassword = await _userService.VerifyPasswordAsync(user.PasswordHash, request.NewPassword);
                if (isSamePassword)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Mật khẩu mới không được trùng với mật khẩu cũ", 400);
                }

                // Update password
                var hashedPassword = await _userService.HashPasswordAsync(request.NewPassword);
                user.UpdatePassword(hashedPassword);

                // Mark token as used and delete
                emailToken.MarkAsUsed();
                await _unitOfWork.EmailTokenRepository.DeleteAsync(emailToken.Id);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Cập nhật mật khẩu mới thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Failed to reset password", 400, ex);
            }
        }
    }
}
