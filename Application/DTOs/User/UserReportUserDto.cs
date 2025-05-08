using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserReportUserDto
    {
        public Guid Id { get; set; } 
        public Guid ReportedByUserId { get; set; }
        public string? ReportedByUserName { get; set; } // Thêm tên người báo cáo
        public string? Reason { get; set; }
        public DateTime ReportDate { get; set; }
        public string? Status { get; set; }
    }
}
