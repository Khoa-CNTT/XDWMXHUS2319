using Application.DTOs.Reposts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.Interface
{
    public interface IReportService
    {
        Task<Guid> CreateReportAsync(Guid postId, string reason);
        Task<ResponseModel<bool>> DeleteAllReportsOfPostAsync(Guid postId);
        Task ProcessReportByAIAsync(ProcessReportDto dto);
        Task ProcessReportByAdminAsync(ProcessReportDto dto);
        Task<IEnumerable<ReportResponseDto>> GetAllReportsAsync();
        Task<ReportDetailsDto?> GetReportDetailsAsync(Guid reportId);
        Task<IEnumerable<ReportResponseDto>> GetReportsByPostAsync(Guid postId);
        Task<List<PostWithReportsDto>> GetAllPostsWithReportsAsync();
        Task<ResponseModel<bool>> SoftDeletePostAsync(Guid postId);
    }
}
