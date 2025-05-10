using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ResponseModel<bool>>
    {
        private readonly IUserService _userService;
        private readonly IUnitOfWork _unitOfWork;
        public ForgotPasswordCommandHandler(IUserService userService, IUnitOfWork unitOfWork)
        {
            _userService = userService;
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<bool>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Check if email exists
                var user = await _unitOfWork.UserRepository.GetUserByEmailAsync(request.Email);
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("User not found", 404);
                }

                // Generate reset token
                var token = await _userService.GenerateTokenAsync(user.Id);
                var resetLink = $"http://localhost:3000/reset-password?token={token}";

                // Save reset token
                var resetToken = new EmailVerificationToken(user.Id, token, DateTime.UtcNow.AddHours(1));
                await _unitOfWork.EmailTokenRepository.AddAsync(resetToken);

                // Send email
                var subject = "Reset Your Password";
                var body = $"Click <a href='{resetLink}'>here</a> to reset your password.";
                var emailSent = await _userService.SendEmailAsync(user.Email, subject, body);

                if (!emailSent)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Failed to send reset email", 400);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(true, "Reset password email sent successfully", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Failed to process reset request", 400, ex);
            }
        }
    }
}
