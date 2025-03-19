
namespace Application.Interface
{
    public interface IJwtProvider
    {
        (string token, string refreshToken) GenerateJwtToken(User user);
        Task<string?> ValidateAndGenerateAccessToken();
    }
}
