namespace Infrastructure.Data.Repositories
{
    public class UserReportRepository : BaseRepository<UserReport>, IUserReportRepository
    {
        public UserReportRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<UserReport>> GetAllUserReportAsync()
        {
            return await _context.UserReports
                .Where(x => !x.IsDeleted && x.Status != "Accepted") // 🔥 Lọc thêm điều kiện Status khác Accepted
                .Include(x => x.ReportedUser)
                .Include(x => x.ReportedByUser)
                .ToListAsync();
        }

        public  async Task<IEnumerable<UserReport>> GetReportsByUserIdAsync(Guid reportedUserId)
        {
            return await _context.UserReports
        .Where(r => r.ReportedUserId == reportedUserId && !r.IsDeleted)
        .ToListAsync();
        }
    }
}
