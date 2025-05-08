using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.CQRS.Commands.Rides;
using Domain.Entities;
using Domain.Interface;
using MediatR;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Rides
{
    public class RateDriverCommandHandler : IRequestHandler<RateDriverCommand, ResponseModel<RateDriverResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public RateDriverCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<RateDriverResponse>> Handle(RateDriverCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Đánh giá phải từ 1 đến 5 sao.", 400);
            }

            // Verify ride exists and is completed
            var ride = await _unitOfWork.RideRepository.GetByIdAsync(request.RideId);
            if (ride == null)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Chuyến đi không tồn tại.", 404);
            }

            if (ride.Status != StatusRideEnum.Completed)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Chuyến đi chưa hoàn thành.", 400);
            }
            if (userId == ride.DriverId)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Bạn không thể tự đánh giá mình.", 400);
            }
            if (userId != ride.PassengerId)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Bạn không phải hành khách của chuyến đi này.", 400);
            }

            // Verify driver
            var driver = await _unitOfWork.UserRepository.GetByIdAsync(ride.DriverId);
            if (driver == null)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Tài xế không tồn tại.", 404);
            }

            // Check if the ride has already been rated
            var existingRating = await _unitOfWork.RatingRepository
                .AnyAsync(r => r.RideId == request.RideId && r.RatedByUserId == userId);
            if (existingRating)
            {
                return ResponseFactory.Fail<RateDriverResponse>("Chuyến đi này đã được đánh giá.", 400);
            }

            // Begin transaction
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // Map rating to RatingLevelEnum
                RatingLevelEnum ratingLevel = (int)Math.Round(request.Rating) switch
                {
                    1 => RatingLevelEnum.Poor,
                    2 => RatingLevelEnum.Poor,
                    3 => RatingLevelEnum.Average,
                    4 => RatingLevelEnum.Good,
                    5 => RatingLevelEnum.Excellent,
                    _ => throw new ArgumentException("Giá trị đánh giá không hợp lệ.", nameof(request.Rating))
                };

                // Create Rating record
                var rating = new Rating(
                    userId: ride.DriverId,
                    ratedByUserId: userId,
                    rideId: request.RideId,
                    level: ratingLevel,
                    comment: request.Comment
                );
                await _unitOfWork.RatingRepository.AddAsync(rating);

                // Calculate score change based on rating
                decimal scoreChange = request.Rating switch
                {
                    1 => -10m,  // 1 sao: Trừ 10 điểm
                    2 => -5m,   // 2 sao: Trừ 5 điểm
                    3 => 0m,    // 3 sao: Không thay đổi
                    4 => 5m,    // 4 sao: Cộng 5 điểm
                    5 => 10m,   // 5 sao: Cộng 10 điểm
                    _ => 0m     // Không bao giờ xảy ra do kiểm tra trước
                };

                // Update driver's trust score
                decimal newTrustScore = Math.Max(0, driver.TrustScore + scoreChange); // Ensure score is not negative
                driver.UpdateTrustScore(Math.Round(newTrustScore, 2));
                await _unitOfWork.UserRepository.UpdateAsync(driver);

                // Create UserScoreHistory record
                var scoreHistory = new UserScoreHistory(
                    userId: ride.DriverId,
                    scoreChange: scoreChange,
                    reason: $"Đánh giá {request.Rating} sao cho chuyến đi. Bình luận: {request.Comment ?? "Không có bình luận"}",
                    totalScoreAfterChange: driver.TrustScore
                );
                await _unitOfWork.UserScoreHistoriesRepository.AddAsync(scoreHistory);

                // Save changes
                await _unitOfWork.SaveChangesAsync();

                // Commit transaction
                await _unitOfWork.CommitTransactionAsync();

                // Create response
                var response = new RateDriverResponse
                {
                    RatingId = rating.Id,
                    NewReliabilityScore = driver.TrustScore,
                    Message = "Đánh giá tài xế thành công."
                };

                return ResponseFactory.Success(response, "Đánh giá tài xế thành công.", 200);
            }
            catch (Exception ex)
            {
                // Rollback transaction
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<RateDriverResponse>("Đã xảy ra lỗi khi đánh giá tài xế.", 500, ex);
            }
        }
    }
}