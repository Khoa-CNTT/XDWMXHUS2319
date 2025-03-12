﻿using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, ResponseModel<UserResponseDto>>
    {
        private readonly IUserService _userService;
        private readonly IUnitOfWork _unitOfWork;
        public RegisterUserCommandHandler(IUserService userService, IUnitOfWork unitOfWork)
        {
            _userService = userService;
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<UserResponseDto>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (request == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<UserResponseDto>("UserCreateDto is null");
                }

                // 🔍 Kiểm tra email đã tồn tại chưa
                if (await _userService.CheckEmailExistsAsync(request.Email))
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<UserResponseDto>("This Email already exists");
                }

                // 🛠️ Tạo user mới (chưa xác minh)
                var user = new User(request.FullName, request.Email, await _userService.HashPasswordAsync(request.Password));
                await _unitOfWork.UserRepository.AddAsync(user);
                // 📩 Gửi email chứa link xác minh
                var tokenSend = await _userService.SendVerifiEmailAsync(user.Id, request.Email);
                if (tokenSend == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<UserResponseDto>("Failed to send verification email");
                }
                // 💾 Lưu token vào DB
                var saveToken = new EmailVerificationToken(user.Id, tokenSend, DateTime.UtcNow.AddHours(1));
                await _unitOfWork.EmailTokenRepository.AddAsync(saveToken);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(_userService.MapUserToUserResponseDto(user), "User registered successfully. Please check your email for verification.");
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<UserResponseDto>("Failed to register user", ex);
            }
        }

    }

}
