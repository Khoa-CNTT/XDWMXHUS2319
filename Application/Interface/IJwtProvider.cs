
namespace Application.Interface
{
    public interface IJwtProvider
    {
        Task<string> GenerateJwtToken(User user);
        Task<string?> ValidateAndGenerateAccessToken();
    }
}
