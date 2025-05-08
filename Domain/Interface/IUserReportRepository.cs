namespace Domain.Interface
{
    public interface IUserReportRepository : IBaseRepository<UserReport>
    {       
        Task<IEnumerable<UserReport>> GetReportsByUserIdAsync(Guid reportedUserId);
        Task<IEnumerable<UserReport>> GetAllUserReportAsync();
    }
}
