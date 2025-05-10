using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AdminUserManagement
{
    public class UserManagerDto
    {
        public Guid Id { get;set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Bio { get; set; }
        public bool IsVerifiedEmail { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal TrustScore { get; set; } = 0;
        public RoleEnum Role { get; set; } = RoleEnum.User;
        public string? RelativePhone { get; set; }
        public string? Phone { get; set; }
        public DateTime? LastActive { get; set; }
        public string Status { get; set; } = "Active"; // Active, Blocked, Suspended
        public int TotalReports { get; set; } = 0;
    }
}
