using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AdminUserManagement
{
    public class UserDetailDto
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Status { get; set; } // Active/Blocked/Suspended
        public DateTime? BlockedUntil { get; set; }
        public DateTime? SuspendedUntil { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public int TotalReports { get; set; }
        public double TrustScore { get; set; }
        public List<UserActionDto>? ActionHistory { get; set; }
    }
}
