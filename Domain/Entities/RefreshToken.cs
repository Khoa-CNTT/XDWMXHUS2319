using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class RefreshToken
    {
        public Guid Id { get;private set; } = Guid.NewGuid();
        public Guid UserId { get; private set; }
        public string Token { get; private set; } = string.Empty;
        public DateTime ExpiryDate { get; private set; }
        public bool IsRevoked { get; private set; } = false;
        public bool IsUsed { get; private set; } = false;
        public string? CreatedByIp { get; private set; }
        // public string? RevokedByIp { get; set; } // 🛠 IP thu hồi token
        public string? ReplacedByToken { get; private set; } // 🔄 Token mới thay thế
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; private set; } // 🆕 Thêm thời gian cập nhật


        public RefreshToken(Guid userId, string token, DateTime expiryDate)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Token = token;
            ExpiryDate = expiryDate;
        }

        // ✅ Đánh dấu token đã sử dụng
        public void MarkAsUsed(string replacedByToken)
        {
            IsUsed = true;
            ReplacedByToken = replacedByToken;
            UpdatedAt = DateTime.UtcNow;
        }

        // ❌ Thu hồi token
        public void Revoke()
        {
            IsRevoked = true;
           // RevokedByIp = revokedByIp;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
