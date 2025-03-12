using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Provider
{
    public static class TokenVerifyEmailProvider
    {
        public static Task<string> GenerateToken(Guid userId, int length = 32)
        {
            var bytes = new byte[length];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }

            string base64Token = Convert.ToBase64String(bytes)
                .Replace('+', '-')
                .Replace('/', '_');

            // Gắn thêm UserId vào token (dùng `.` làm dấu phân cách)
            return Task.FromResult($"{base64Token}.{userId}");
        }

    }

}
