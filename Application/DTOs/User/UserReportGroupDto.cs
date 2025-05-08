using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public  class UserReportGroupDto
    {
        public Guid ReportedUserId { get; set; }
        public string? ReportedUserName { get; set; }
        public int TotalReports { get; set; }
        public List<UserReportUserDto> Reports { get; set; } = new();
    }
}
