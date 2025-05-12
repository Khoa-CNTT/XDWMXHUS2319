using Application.CQRS.Commands.Posts;
using Application.DTOs.Reposts;
using Application.DTOs.User;
using Application.Interface;
using Application.Services;
using Domain.Interface;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    
    [ApiController]
    [Route("api/report")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IMediator _mediator;
        private readonly IRideReportService _rideReportService;

        public ReportController(IReportService reportService, IMediator mediator, IRideReportService rideReportService)
        {
            _reportService = reportService;
            _mediator = mediator;
            _rideReportService = rideReportService;
        }
        // 📝 Người dùng gửi báo cáo bài viết
        [Authorize]
        [HttpPost("report-post")]
        public async Task<IActionResult> CreateReportPost([FromBody] CreateReportPostCommand command)
        {
          var result = await _mediator.Send(command);
          return Ok(result);
        }

        // 🧾 Lấy chi tiết 1 báo cáo
        [HttpGet("{reportId}")]
        public async Task<IActionResult> GetReportById(Guid reportId)
        {
            var report = await _reportService.GetReportDetailsAsync(reportId);
            if (report == null) return NotFound("Report not found");
            return Ok(report); // đã là ReportDetailsDto
        }

        // 📋 Lấy danh sách các báo cáo theo bài post
        [HttpGet("by-post/{postId}")]
        public async Task<IActionResult> GetReportsByPost(Guid postId)
        {
            var reports = await _reportService.GetReportsByPostAsync(postId); // List<ReportResponseDto>
            return Ok(reports);
        }
        // 📜 Lấy danh sách tất cả báo cáo
        [HttpGet("all")]
        public async Task<IActionResult> GetAllReports()
        {
            var reports = await _reportService.GetAllReportsAsync();
            return Ok(reports);
        }
        // 👨‍💼 Admin xử lý báo cáo
        [HttpPost("admin-process")]
        public async Task<IActionResult> ProcessByAdmin([FromBody] ProcessReportDto dto)
        {
            await _reportService.ProcessReportByAdminAsync(dto);
            return Ok(new { Message = "Processed by Admin successfully" });
        }

        [HttpGet("posts-report")]
        public async Task<IActionResult> GetAllPostsWithReports()
        {
            var postsWithReports = await _reportService.GetAllPostsWithReportsAsync();
            return Ok(postsWithReports);
        }
        [HttpPatch("delete-post-report/{postId}")]
        public async Task<IActionResult> DeletePostReport(Guid postId)
        {
           var result =  await _reportService.SoftDeletePostAsync(postId);
            return Ok(result);
        }
        [HttpDelete("delete-all-report/{postId}")]
        public async Task<IActionResult> DeleteAllReport(Guid postId)
        {
            var result = await _reportService.DeleteAllReportsOfPostAsync(postId);
            return Ok(result);
        }
        /// <summary>
        /// Lấy tất cả báo cáo người dùng
        /// </summary>
        [HttpGet("user-user-report")]
        public async Task<ActionResult<IEnumerable<UserReportUserDto>>> GetAllUserReports()
        {
            var result = await _reportService.GetAllUserReportsAsync();
            return Ok(result);
        }

        [HttpDelete("user-reports/{userId}")]
        public async Task<IActionResult> DeleteAllUserReportsByUserId(Guid userId)
        {
            var result = await _reportService.DeleteAllUserReportsByUserIdAsync(userId);
            return Ok(result);
        }

        [HttpPost("accept-by-user/{reportedUserId}")]
        public async Task<IActionResult> AcceptReportsByUserId(Guid reportedUserId)
        {
            var result = await _reportService.AcceptUserReportsByUserIdAsync(reportedUserId);
            return Ok(result);
        }
        /// <summary>
        /// Lấy danh sách báo cáo chuyến đi theo loại cảnh báo (DriverGPSOff).
        /// </summary>
        /// <returns>Danh sách RideReportDto</returns>
        [HttpGet("admin/ride-reports")]
        public async Task<IActionResult> GetFilteredReports()
        {
            var reports = await _rideReportService.GetFilteredReportsAsync();
            return Ok(reports);
        }
    }
}
