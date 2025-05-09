using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AdminUserManagement
{
    public class UserFilterDto
    {
        public string? SearchKeyword { get; set; } // Tên hoặc Email
        public string? Status { get; set; }        // Active, Blocked, Suspended
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
    }
}
