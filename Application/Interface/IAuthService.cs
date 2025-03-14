using Application.DTOs.User;


namespace Application.Interface
{
    public interface IAuthService
    {
        Task<ResponseModel<string>> LoginAsync(UserLoginDto user);
        Task<string> GetRoleNameByIdAsync(int roleId);
        Task<ResponseModel<string>?> RefreshTokenAsync();
    }
}
