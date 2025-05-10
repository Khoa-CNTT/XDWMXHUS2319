using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.DasbroadAdmin
{
    public class DashboardUserStatsDto
    {
        public int ActiveUsers { get; set; }
        public int SuspendedUsers { get; set; }
        public int LockedUsers { get; set; }
    }
}
