using Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IDasbroadAdminService _adminDashboardService;
        public AdminDashboardController(IDasbroadAdminService adminDashboardService)
        {
            _adminDashboardService = adminDashboardService;
        }
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var result = await _adminDashboardService.GetOverviewAsync();
            return Ok(result);
        }
        [HttpGet("user-stats")]
        public async Task<IActionResult> GetUserStats()
        {
            var result = await _adminDashboardService.GetUserStatsAsync();
            return Ok(result);
        }
        [HttpGet("report-stats")]
        public async Task<IActionResult> GetReportStats()
        {
            var result = await _adminDashboardService.GetReportStatsAsync();
            return Ok(result);
        }
    }
}
