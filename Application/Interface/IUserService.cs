using Application.DTOs.User;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IUserService
    {
        UserResponseDto MapUserToUserResponseDto(User user);
        Task<bool> CheckEmailExistsAsync(string email);
        Task<string> HashPasswordAsync(string password);
        Task<string?> SendVerifiEmailAsync(Guid userId,string email);
        Task<string> GenerateTokenAsync(Guid userId);
    }
}
