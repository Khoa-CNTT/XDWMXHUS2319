using Application.DTOs.User;
using Application.Provider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        public UserService(IUnitOfWork unitOfWork, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
        }
        public UserResponseDto MapUserToUserResponseDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            if(string.IsNullOrEmpty(email) || string.IsNullOrWhiteSpace(email))
            {
                return false;
            }
            return await _unitOfWork.UserRepository.GetExsitsEmailAsync(email);
        }

        public Task<string> HashPasswordAsync(string password)
        {
          
            return Task.FromResult(password);
        }

        public async Task<string?> SendVerifiEmailAsync(Guid userId,string email)
        {
            try
            {
                var token = await GenerateTokenAsync(userId);
                // Tạo link xác minh
                var verificationLink = $"https://localhost:7053/api/auth/verify-email?token={token}";

                //Nội dung email
                var subject = "Verify Your Email";
                var body = $"Click <a href='{verificationLink}'>here</a> to verify your email.";

                // Gửi email
                bool isSuccess = await _emailService.SendEmailAsync(email, subject, body);
                if (isSuccess)
                {
                    return token;
                }
                else
                {
                    return null;
                }

            }
            catch 
            {
                    return null;
            }
        }
        public async Task<string> GenerateTokenAsync(Guid userId)
        {
            return await TokenVerifyEmailProvider.GenerateToken(userId);
        }
    }
}
