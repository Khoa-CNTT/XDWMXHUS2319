
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class TokenService : ITokenService
    {
        private readonly IUnitOfWork _unitOfWork;
        public TokenService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

        }

        public async Task<RefreshToken> AddRefreshTokenAsync(User user, string rerefreshToken, IHttpContextAccessor _httpContextAccessor)
        {
            if (user is null) throw new ArgumentNullException(nameof(user));
            if (string.IsNullOrEmpty(rerefreshToken)) throw new ArgumentNullException(nameof(rerefreshToken));
            if (_httpContextAccessor is null) throw new ArgumentNullException(nameof(_httpContextAccessor));

            // 📌 Kiểm tra xem HttpContext có null không trước khi truy cập
            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

            var refreshToken = new RefreshToken(user.Id, rerefreshToken, DateTime.UtcNow.AddDays(7), ipAddress);

            var check = await _unitOfWork.RefreshtokenRepository.AddAsync(refreshToken);
            if (check is null)
                throw new Exception("Can't add refresh token");

            return refreshToken;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _unitOfWork.RefreshtokenRepository.GetByTokenAsync(token);
        }
    }
}
