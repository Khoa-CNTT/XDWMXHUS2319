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

        public async override Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.Reports.FindAsync(id);
            if (entity == null)
                return false;

            _context.Reports.Remove(entity);
            return true;
        }

        public async Task<IEnumerable<Report>> GetByPostIdAsync(Guid postId)
        {
            return await _context.Reports
            
            .Where(r => r.PostId == postId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
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

        public async Task<Report?> GetReportDetailsAsync(Guid reportId)
        {
            return await _context.Reports
                .Include(r => r.Post)
                .Include(r => r.ReportedByUser)
                .FirstOrDefaultAsync(r => r.Id == reportId);
        }

        public async Task<List<Report>> GetReportsByPostIdDeleteAsync(Guid postId)
        {
            return await _context.Reports
                .Where(c => c.PostId == postId && !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<List<Report>> GetReportsByPostIdsAsync(List<Guid> postIds)
        {
            return await _context.Reports
       .Include(r => r.ReportedByUser)
       .Where(r => postIds.Contains(r.PostId) && !r.IsDeleted)
       .ToListAsync();
        }
    }
}
