using Application.DTOs.DasbroadAdmin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IDasbroadAdminService
    {
        Task<DashboardOverviewDto> GetOverviewAsync();
        Task<DashboardReportStatsDto> GetReportStatsAsync();
        Task<DashboardUserStatsDto> GetUserStatsAsync();
        Task<DashboardTrustScoreStatsDto> GetTrustScoreDistributionAsync();


    }
}
