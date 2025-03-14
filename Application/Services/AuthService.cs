﻿using Application.DTOs.User;
using Application.Helpers;
using Application.Model;
using Domain.Entities;


namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtProvider _jwtProvider;
        public AuthService(IUnitOfWork unitofWork, IJwtProvider jwtProvider)
        {
            _unitOfWork = unitofWork;
            _jwtProvider = jwtProvider;
        }
        public Task<string> GetRoleNameByIdAsync(int roleId)
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseModel<string>> LoginAsync(UserLoginDto user)
        {
            var isExists = await _unitOfWork.UserRepository.GetUserByEmailAsync(user.Email);
            if (isExists == null)
            {
                return ResponseFactory.Fail<string>("User not found", 404);
            }
            if (!isExists.IsVerifiedEmail)
            {
                return ResponseFactory.Fail<string>("Email is not verified", 404);
            }
            //kiểm tra mật khẩu 
            bool check = await Task.Run(() => BCrypt.Net.BCrypt.Verify(user.Password,isExists.PasswordHash));
            if (!check)
            {
                return ResponseFactory.Fail<string>("Password is incorrect", 404);
            }
            var token = await _jwtProvider.GenerateJwtToken(isExists);
            return ResponseFactory.Success(token, "Đăng nhập thành công",200);
        }

        public async Task<ResponseModel<string>?> RefreshTokenAsync()
        { 
            var token = await _jwtProvider.ValidateAndGenerateAccessToken();
            if (token == null)
            {
                return ResponseFactory.Fail<string>("Refresh token is invalid or expired", 404);
            }

            return ResponseFactory.Success(token, "Refresh token is valid",200);
        }


    }
}
