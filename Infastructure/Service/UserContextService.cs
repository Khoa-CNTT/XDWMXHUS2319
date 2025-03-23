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

        public string FullName()
        {
            var fullName = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(fullName))
            {
                throw new UnauthorizedAccessException("User Full Name not found in token");
            }

            return fullName;
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
