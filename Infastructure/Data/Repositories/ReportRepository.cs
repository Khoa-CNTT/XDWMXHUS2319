using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class ReportRepository : BaseRepository<Report>, IReportRepository
    {
        public ReportRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }
        public Task<int> GetCorrectReportCountAsync(Guid userId)
        {
            return _context.Reports
                .CountAsync(r => r.ReportedBy == userId && r.Status == ReportStatusEnum.Rejected);
        }
        public Task<int> GetReportCountAsync(Guid userId)
        {
            return _context.Reports
                .CountAsync(r => r.ReportedBy == userId);
        }
    }
}
