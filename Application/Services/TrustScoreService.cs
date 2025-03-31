using Domain.Entities;
using Microsoft.ML;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class TrustScoreService : ITrustScoreService
    {
        private readonly IUnitOfWork _unitOfWork;
        public TrustScoreService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<decimal> CalculateTrustScoreAsync(Guid userId)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null) return 0m; // 0m là decimal literal

            try
            {
                // Lấy các thông tin cần thiết từ Repository
                var postCount = await _unitOfWork.PostRepository.GetPostCountAsync(userId);
                var likeCount = await _unitOfWork.LikeRepository.GetLikeCountAsync(userId);
                var commentCount = await _unitOfWork.CommentRepository.GetCommentCountAsync(userId);
                var shareCount = await _unitOfWork.ShareRepository.GetShareCountAsync(userId);
                var ridePostCount = await _unitOfWork.RidePostRepository.GetRidePostCountAsync(userId);
                var driveRideCount = await _unitOfWork.RideRepository.GetDriveRideCountAsync(userId);
                var passengerRideCount = await _unitOfWork.RideRepository.GetPassengerRideCountAsync(userId);

                // Điểm từ đánh giá tài xế (20 điểm nếu tốt, -40 điểm nếu kém)
                var driverRatingScore = await _unitOfWork.RatingRepository.GetDriverRatingScoreAsync(userId);

                // Điểm từ hành khách đánh giá tài xế (5 điểm mỗi lần)
                var passengerRatingScore = await _unitOfWork.RatingRepository.GetPassengerRatingScoreAsync(userId);

                var correctReportCount = await _unitOfWork.ReportRepository.GetCorrectReportCountAsync(userId);
                var reportCount = await _unitOfWork.ReportRepository.GetReportCountAsync(userId);
                var warningCount = await _unitOfWork.RideReportRepository.GetWarningCountAsync(userId);
                //var banCount = await _unitOfWork.UserRepository.GetBanCountAsync(userId); // Thêm số lần bị cấm

                // Bước 1: Tính tổng điểm tích lũy trước chuẩn hóa
                float trustScore = 0;

                // Điểm cố định
                trustScore += user.IsVerifiedEmail ? 10 : 0;
                trustScore += (!string.IsNullOrEmpty(user.Phone) && !string.IsNullOrEmpty(user.RelativePhone)) ? 10 : 0;

                // Điểm theo hành động
                trustScore += postCount * 10;           // 10 điểm mỗi bài đăng
                trustScore += likeCount * 2;            // 2 điểm mỗi like
                trustScore += commentCount * 3;         // 3 điểm mỗi bình luận
                trustScore += shareCount * 5;           // 5 điểm mỗi share
                trustScore += ridePostCount * 10;       // 10 điểm mỗi bài đăng đi chung xe
                trustScore += driveRideCount * 15;      // 15 điểm mỗi lần làm tài xế
                trustScore += passengerRideCount * 5;   // 5 điểm mỗi lần làm hành khách
                trustScore += driverRatingScore;        // 20 điểm nếu đánh giá tốt, -40 nếu kém
                trustScore += passengerRatingScore;     // 5 điểm mỗi lần hành khách đánh giá tài xế
                trustScore += correctReportCount * 5;   // 5 điểm mỗi báo cáo đúng

                // Trừ điểm khi bị báo cáo, cảnh báo hoặc cấm
                trustScore -= reportCount * 20;         // -20 điểm mỗi lần bị báo cáo
                trustScore -= warningCount * 10;        // -10 điểm mỗi lần bị cảnh báo
                //trustScore -= banCount * 100;           // -100 điểm mỗi lần bị cấm

                // Bước 2: Áp dụng Logarithmic Scaling
                decimal logScore = 10 * (decimal)Math.Log(1 + Math.Max(trustScore, 0)); // Đảm bảo không âm trước khi log

                // Bước 3: Áp dụng Time Decay
                decimal finalScore = logScore;
                if (user.LastActive.HasValue)
                {
                    var monthsInactive = (DateTime.UtcNow - user.LastActive.Value).TotalDays / 30.0; // Tính số tháng không hoạt động
                    float lambda = 0.01f; // Hệ số decay λ = 0.01 mỗi tháng
                    finalScore = logScore * (decimal)Math.Exp(-lambda * monthsInactive); // Áp dụng e^(-λ*t)
                }
                //làm tròn 2 chữ số thập phân
                return decimal.Round(finalScore, 2); // Làm tròn đến 2 chữ số thập phân
            }
            catch (Exception ex)
            {
                throw new Exception("Error when calculating user's trust score", ex);
            }
        }

        public async Task UpdateTrustScoreAsync()
        {
            try
            {
                // Lấy danh sách user nhưng không tracking để tránh lỗi
                var users = await _unitOfWork.UserRepository.GetAllUsersAsync();

                foreach (var user in users)
                {
                    // Tính lại TrustScore
                    var newTrustScore = await CalculateTrustScoreAsync(user.Id);
                    user.UpdateTrustScore(newTrustScore);
                    Console.WriteLine("Updated trust score for user: " + user.Id + " to " + newTrustScore);
                    // Gửi user đã cập nhật vào repository để update
                    await _unitOfWork.UserRepository.UpdateAsync(user);
                }

                // Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error when updating trust score", ex);
            }
        }
    }

}
