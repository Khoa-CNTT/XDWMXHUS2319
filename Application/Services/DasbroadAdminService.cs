using Application.DTOs.DasbroadAdmin;

namespace Application.Services
{
    public class DasbroadAdminService : IDasbroadAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DasbroadAdminService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        

        public async Task<DashboardOverviewDto> GetOverviewAsync()
        {
            var totalUsers = await _unitOfWork.UserRepository.CountAsync();
            var totalLockedUsers = await _unitOfWork.UserRepository.CountAsync(x => x.Status == "Blocked");
            var totalUserReports = await _unitOfWork.UserReportRepository.CountAsync();
            var totalPostReports = await _unitOfWork.ReportRepository.CountAsync(); // Giả sử Report = bài viết bị báo cáo

            return new DashboardOverviewDto
            {
                TotalUsers = totalUsers,
                TotalLockedUsers = totalLockedUsers,
                TotalUserReports = totalUserReports,
                TotalPostReports = totalPostReports
            };
        }

        public async Task<DashboardReportStatsDto> GetReportStatsAsync()
        {
            var pendingReports = await _unitOfWork.UserReportRepository.CountAsync(x => x.Status == "Pending");
            var acceptedReports = await _unitOfWork.UserReportRepository.CountAsync(x => x.Status == "Accepted");
            var rejectedReports = await _unitOfWork.UserReportRepository.CountAsync(x => x.Status == "Rejected");

            return new DashboardReportStatsDto
            {
                PendingReports = pendingReports,
                AcceptedReports = acceptedReports,
                RejectedReports = rejectedReports
            };
        }

        public async Task<DashboardTrustScoreStatsDto> GetTrustScoreDistributionAsync()
        {
            var users = await _unitOfWork.UserRepository.GetAllAsync();
            var reliable  = users.Count(x => x.TrustScore >= 50);
            var unreliable = users.Count(x => x.TrustScore < 50);
            return new DashboardTrustScoreStatsDto
            {
                reliableTrustScore = reliable,
                unreliableTrustScore = unreliable
            };
        }

        public async Task<DashboardUserStatsDto> GetUserStatsAsync()
        {
            var activeUsers = await _unitOfWork.UserRepository.CountAsync(x => x.Status == "Active");
            var suspendedUsers = await _unitOfWork.UserRepository.CountAsync(x => x.Status == "Suspended");
            var lockedUsers = await _unitOfWork.UserRepository.CountAsync(x => x.Status == "Blocked");

            return new DashboardUserStatsDto
            {
                ActiveUsers = activeUsers,
                SuspendedUsers = suspendedUsers,
                LockedUsers = lockedUsers
            };
        }
    }    
}
