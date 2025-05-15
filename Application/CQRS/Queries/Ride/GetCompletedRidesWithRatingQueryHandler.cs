using Application.DTOs.Ride;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Ride
{
    public class GetCompletedRidesWithRatingQueryHandler : IRequestHandler<GetCompletedRidesWithRatingQuery, ResponseModel<List<CompletedRideWithRatingDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public GetCompletedRidesWithRatingQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<List<CompletedRideWithRatingDto>>> Handle(GetCompletedRidesWithRatingQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
                return ResponseFactory.Fail<List<CompletedRideWithRatingDto>> ("User not found", 404);
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                return ResponseFactory.Fail<List<CompletedRideWithRatingDto>> ("Người dùng không tồn tại", 404);
            if (user.Status == "Suspended")
                return ResponseFactory.Fail<List<CompletedRideWithRatingDto>> ("Tài khoản đang bị tạm ngưng", 403);

            var rides = await _unitOfWork.RideRepository.GetCompletedRidesWithRatingAsync(request.UserId);
            if (!rides.Any())
            {
                return ResponseFactory.Success<List<CompletedRideWithRatingDto>>("Không có bài chia sẻ xe nào được đánh giá", 200);
            }
            var result = rides.Select(ride => new CompletedRideWithRatingDto
            {
                RideId = ride.Id,
                RidePostId = ride.RidePostId,
                Content = ride.RidePost?.Content,
                StartLocation = ride.RidePost?.StartLocation,
                EndLocation = ride.RidePost?.EndLocation,
                StartTime = ride.RidePost?.StartTime ?? DateTime.MinValue,
                CreatedAt = ride.CreatedAt,

                Driver = ride.Driver == null ? null : new DriverInfoDto
                {
                    DriverId = ride.Driver.Id,
                    Fullname = ride.Driver.FullName,
                    AvatarUrl = $"{Constaint.baseUrl}{ride.Driver.ProfilePicture}"
                },
                Rating = ride.Rating != null ? new RatingInfoDto
                {
                    Level = (int)ride.Rating.Level,
                    Comment = ride.Rating.Comment,
                    CreatedAt = ride.Rating.CreatedAt,
                    RatedByUser = ride.Rating.RatedByUser != null ? new RatedByUserDto
                    {
                        RatedByUserId = ride.Rating.RatedByUser.Id,
                        Fullname = ride.Rating.RatedByUser.FullName,
                        AvatarUrl = $"{Constaint.baseUrl}{ride.Rating.RatedByUser.ProfilePicture}"
                    } : null
                } : null
            }).ToList();

            return ResponseFactory.Success(result, "Lấy tất cả bài chia sẽ xe có đánh giá thành công", 200);
        }
    }
}
