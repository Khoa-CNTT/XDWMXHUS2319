using Application.DTOs.User;
namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtProvider _jwtProvider;
        private readonly ITokenService _tokenService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AuthService(IUnitOfWork unitofWork, IJwtProvider jwtProvider, ITokenService tokenService, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitofWork;
            _jwtProvider = jwtProvider;
            _tokenService = tokenService;
            _httpContextAccessor = httpContextAccessor;
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
            // 👉 Thêm kiểm tra Status
            if (isExists.Status == "Blocked")
            {
                return ResponseFactory.Fail<string>("Tài khoản đã bị khóa", 403);
            }
            
            //kiểm tra mật khẩu 
            bool check = await Task.Run(() => BCrypt.Net.BCrypt.Verify(user.Password,isExists.PasswordHash));
            if (!check)
            {
                return ResponseFactory.Fail<string>("Password is incorrect", 404);
            }
            var (token,refreshToken) = _jwtProvider.GenerateJwtToken(isExists);
            if (token == null || refreshToken == null)
            {
                return ResponseFactory.Fail<string>("Can't generate token", 404);
            }
            
                //lưu refresh token vào db
                await _tokenService.AddRefreshTokenAsync(isExists, refreshToken);
                return ResponseFactory.Success(token, "Đăng nhập thành công", 200);       
        }

        public async Task<ResponseModel<string>?> RefreshTokenAsync()
        {
            var context = _httpContextAccessor.HttpContext;  // Lấy HttpContext

            if (context == null || !context.Request.Cookies.TryGetValue("refreshToken", out var oldRefreshToken))
            {
                return ResponseFactory.Fail<string>("HttpContext không hợp lệ", 400);
            }

            // Kiểm tra nếu cookie refreshToken không tồn tại
            if (!context.Request.Cookies.ContainsKey("refreshToken"))
            {
                return ResponseFactory.Fail<string>("Refresh token không có trong cookie", 400);
            }

            var refreshToken = context.Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return ResponseFactory.Fail<string>("Refresh token là rỗng hoặc không hợp lệ", 400);
            }

            // Lấy userId từ refresh token
            var userId = (await _tokenService.GetByTokenAsync(refreshToken))?.UserId;

            if (userId == null) return null;

            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId.Value);
            if (user == null) return null;

            // Sửa: Xóa refresh token cũ
            await _tokenService.RevokeRefreshTokenAsync(oldRefreshToken);

            // Tạo token mới
            var (newAccessToken, newRefreshToken) = _jwtProvider.GenerateJwtToken(user);
            await _tokenService.AddRefreshTokenAsync(user, newRefreshToken);

            return ResponseFactory.Success(newAccessToken, "Refresh token successful", 200);
        }
    }
}
