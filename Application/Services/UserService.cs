using Application.CQRS.Commands.Users;
using Application.CQRS.Queries.User;
using Application.DTOs.User;
using Application.Interface.ContextSerivce;
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
        private readonly IUserContextService _userContextService;
        public UserService(IUnitOfWork unitOfWork, IEmailService emailService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _userContextService = userContextService;
        }
        public UserResponseDto MapUserToUserResponseDto(User user)
        {
            return new UserResponseDto
            {
                FullName = user.FullName,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            };
        }
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            //if (!email.EndsWith("@.edu.dtu.vn",StringComparison.OrdinalIgnoreCase)
            //    || !email.EndsWith("@.edu.dtu.vn", StringComparison.OrdinalIgnoreCase)) {
            //    return false;
            //}
            if(string.IsNullOrEmpty(email) || string.IsNullOrWhiteSpace(email))
            {
                return false;
            }
            return await _unitOfWork.UserRepository.GetExsitsEmailAsync(email);
        }

        public async Task<string> HashPasswordAsync(string password)
        {
            return await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(password, 12));
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
        public async Task<bool> SendEmailAsync(string email, string subject, string body)
        {
            try
            {
                return await _emailService.SendEmailAsync(email, subject, body);
            }
            catch
            {
                return false;
            }
        }
        public async Task<string> GenerateTokenAsync(Guid userId)
        {
            return await TokenVerifyEmailProvider.GenerateToken(userId);
        }

        public async Task<User?> GetByIdAsync(Guid userId)
        {
            return await _unitOfWork.UserRepository.GetByIdAsync(userId);
        }
        public async Task<bool> VerifyPasswordAsync(string hashedPassword, string providedPassword)
        {
            return  BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);
        }
    }   
}
