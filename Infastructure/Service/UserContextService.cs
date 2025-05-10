using Application.Interface.ContextSerivce;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Service
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string AccessToken()
        {
            // 1. Thử lấy token từ claims
            var accessToken = _httpContextAccessor.HttpContext?.User.FindFirst("access_token")?.Value;

            // 2. Nếu không có, thử lấy từ query string
            if (string.IsNullOrEmpty(accessToken))
            {
                accessToken = _httpContextAccessor.HttpContext?.Request.Query["access_token"];
            }

            // 3. Nếu vẫn không có, thử lấy từ header Authorization (fallback)
            if (string.IsNullOrEmpty(accessToken))
            {
                accessToken = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"]
                    .ToString().Replace("Bearer ", "");
            }

            if (string.IsNullOrEmpty(accessToken))
            {
                throw new UnauthorizedAccessException("Access token not found in claims, query string, or request headers");
            }

            return accessToken;
        }

        public string FullName()
        {
            var fullName = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(fullName))
            {
                throw new UnauthorizedAccessException("User Full Name not found in token");
            }

            return fullName;
        }

        public bool IsAuthenticated()
        {
            var isAuthenticated = _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
            if (!isAuthenticated)
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }
            return isAuthenticated;
        }

        public string Role()
        {
            var role = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(role))
            {
                throw new UnauthorizedAccessException("User Role not found in token");
            }
            return role;
        }

        public Guid UserId()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            if (!Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid User ID format");
            }

            return userId;
        }
    }
}
