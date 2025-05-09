using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserAction
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public Guid AdminId { get; private set; }
        public string Action { get; private set; }
        public DateTime ActionDate { get; private set; } = DateTime.UtcNow;
        
        public User User { get; set; }


        public UserAction(Guid userId, Guid adminId, string action)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            AdminId = adminId;
            Action = action;
        }
    }
}
