using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.DasbroadAdmin
{
    public class DashboardOverviewDto
    {
        public int TotalUsers { get; set; }
        public int TotalLockedUsers { get; set; }
        public int TotalUserReports { get; set; }
        public int TotalPostReports { get; set; }
    }
}
