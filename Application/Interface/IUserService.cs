using Application.DTOs.AdminUserManagement;
using Application.DTOs.User;

namespace Application.Interface
{
    public interface IUserService
    {
        UserResponseDto MapUserToUserResponseDto(User user);
        Task<bool> CheckEmailExistsAsync(string email);
        Task<string> HashPasswordAsync(string password);
        Task<string?> SendVerifiEmailAsync(Guid userId,string email);
        Task<string> GenerateTokenAsync(Guid userId);
        Task<User?> GetByIdAsync(Guid userId);

        Task<bool> SendEmailAsync(string email, string subject, string body);
        Task<bool> VerifyPasswordAsync(string hashedPassword, string providedPassword);
      
        Task<ResponseModel<UserDto>> BlockUserAsync(Guid userId, DateTime blockUntil);
        Task<ResponseModel<UserDto>> SuspendUserAsync(Guid userId, DateTime suspendUntil);
        Task<ResponseModel<UserDto>> UnblockUserAsync(Guid userId);
        Task<ResponseModel<List<UserDto>>> GetUsersAsync(string? status = null, string? search = null);
        Task<ResponseModel<UserDto>> GetUserDetailsAsync(Guid userId);
        Task<ResponseModel<List<UserManagerDto>>> GetAllUsersAsync();

    }
}
