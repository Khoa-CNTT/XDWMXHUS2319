using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.DasbroadAdmin
{
    public class DashboardTrustScoreStatsDto
    {
        public decimal reliableTrustScore { get; set; }
        public decimal unreliableTrustScore { get; set; }
    }
}
