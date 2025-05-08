using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.DasbroadAdmin
{
    public class DashboardReportStatsDto
    {
        public int PendingReports { get; set; }
        public int AcceptedReports { get; set; }
        public int RejectedReports { get; set; }
    }
}
