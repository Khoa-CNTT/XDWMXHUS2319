using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
   public class EmailVerificationToken
    {
        public Guid Id { get;private set; } = Guid.NewGuid();
        public Guid UserId { get; private set; }
        public string Token { get; private set; } = string.Empty;
        public DateTime ExpiryDate { get; private set; }
        public bool IsUsed { get; private set; } = false;
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public EmailVerificationToken(Guid userId, string token, DateTime expiryDate)
        {
            UserId = userId;
            Token = token;
            ExpiryDate = expiryDate;
        }
        public void MarkAsUsed()
        {
            IsUsed = true;
        }
        public void SetToken(string token)
        {
            Token = token;
        }
        public void IsUsedToken()
        {
            IsUsed = true;
        }
    }
}
