
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ITokenService
    {
        
        Task<RefreshToken> AddRefreshTokenAsync(User user, string rerefreshToken);
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task RevokeRefreshTokenAsync(string token);
    }
}
