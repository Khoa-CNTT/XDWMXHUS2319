using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;


namespace Domain.Interface
{
    public interface IReportRepository : IBaseRepository<Report>
    {
        Task<int> GetCorrectReportCountAsync(Guid userId);
        Task<int> GetReportCountAsync(Guid userId);
        Task<List<Report>> GetReportsByPostIdDeleteAsync(Guid postId);
        Task<IEnumerable<Report>> GetByPostIdAsync(Guid postId);
        Task<Report?> GetReportDetailsAsync(Guid reportId);

    }
}
