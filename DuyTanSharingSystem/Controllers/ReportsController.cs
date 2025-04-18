using Application.CQRS.Commands.Posts;
using Application.DTOs.Reposts;
using Application.Interface;
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

        public ReportController(IReportService reportService, IMediator mediator)
        {
            _reportService = reportService;
            _mediator = mediator;
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
    }
}
