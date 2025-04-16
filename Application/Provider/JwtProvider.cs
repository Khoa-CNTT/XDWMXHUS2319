using Application.Model;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Application.Provider
{
    public class JwtProvider : IJwtProvider
    {
        private readonly JwtSettings _jwtSettings;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;

        public JwtProvider(IOptions<JwtSettings> jwtSettings, 
            IHttpContextAccessor httpContextAccessor,
            ITokenService tokenService,
            IUserService userService)
        {
            _jwtSettings = jwtSettings.Value ?? throw new ArgumentNullException(nameof(jwtSettings));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }
        //thiếu RefreshToken
        public async Task<string?> ValidateAndGenerateAccessToken()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || !context.Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                return null; // ❌ Không có Refresh Token trong Cookie
            }

            try
            {
                // 🔥 Lấy Refresh Token từ DB
                var storedRefreshToken = await _tokenService.GetByTokenAsync(refreshToken);
                if (storedRefreshToken == null || storedRefreshToken.ExpiryDate < DateTime.UtcNow || storedRefreshToken.IsRevoked)
                {
                    return null; // ❌ Token không hợp lệ hoặc đã hết hạn
                }

                // 🔥 Lấy UserId từ Refresh Token
                var userIdFromToken = storedRefreshToken.UserId;

                // 🔥 Lấy thông tin User từ Database
                var user = await _userService.GetByIdAsync(userIdFromToken);
                if (user == null) return null; // ❌ User không tồn tại

                // ✅ Kiểm tra Refresh Token có khớp với User không (Tránh token giả mạo)
                if (storedRefreshToken.UserId != user.Id)
                {
                    return null; // ❌ Token không hợp lệ
                }

                // ✅ Tạo Access Token mới
                var (newAccessToken,_) =  GenerateJwtToken(user);

                return newAccessToken;
            }
            catch
            {
                return null;
            }
        }


        public (string token,string refreshToken) GenerateJwtToken(User user)
        {
            if (string.IsNullOrEmpty(_jwtSettings.Key) ||
                string.IsNullOrEmpty(_jwtSettings.Issuer) ||
                string.IsNullOrEmpty(_jwtSettings.Audience))
            {
                throw new InvalidOperationException("JWT settings are not configured properly.");
            }
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role,user.Role.ToString()),
            };
            //Đây là khóa bí mật để ký token.
            //Dùng thuật toán mã hóa HmacSha256 để đảm bảo token không thể bị giả mạo.

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            //Tạo chữ ký số để xác thực token.
            //Giúp server kiểm tra token có bị thay đổi hay không.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
           
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token).Trim();
            // 🔥 Tạo Refresh Token (7 ngày)
            var refreshToken = GenerateRefreshToken();
            
           
            // ✅ Lưu Refresh Token vào Cookie
            _httpContextAccessor.HttpContext?.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,  // 🔐 Chống XSS
                Secure = false,    // 🔒 Chỉ gửi qua HTTPS
                SameSite = SameSiteMode.Strict, // 🛡 Chống CSRF
                Expires = DateTime.UtcNow.AddDays(7) // ⏳ Refresh Token hết hạn sau 7 ngày
            });

            return (tokenString,refreshToken);

        }
        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        /*
            Tham số	                            Ý nghĩa
           _configuration["Jwt:Issuer"]	        Ai phát hành token (server).
           _configuration["Jwt:Audience"]	        Ai có thể sử dụng token (client).
           claims	                                Các thông tin (username, role,...) lưu trong token.
           expires: DateTime.UtcNow.AddHours(1)	Thời gian hết hạn (1 giờ).
           signingCredentials: creds	            Cách ký token để đảm bảo an toàn.
            */
    }
}
