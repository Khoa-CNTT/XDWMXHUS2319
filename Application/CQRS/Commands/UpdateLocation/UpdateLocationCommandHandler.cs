using Application.DTOs.UpdateLocation;
using Application.Interface.ContextSerivce;
using Application.Model.Events;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

namespace Application.CQRS.Commands.UpdateLocation
{
    public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, ResponseModel<UpdateLocationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRidePostService _ridePostService;
        private readonly IRedisService _redisService;
        private readonly IUserContextService _userContextService;
        private readonly IPublisher _publiser;

        public UpdateLocationCommandHandler(IUnitOfWork unitOfWork, 
            IRidePostService ridePostService,
            IRedisService redisService,
            IUserContextService userContextService,
            IPublisher publisher)
        {
            _unitOfWork = unitOfWork;
            _ridePostService = ridePostService;
            _redisService = redisService;
            _userContextService = userContextService;
            _publiser = publisher;

        }

        public async Task<ResponseModel<UpdateLocationDto>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
        {
            if (!IsValidCoordinates(request.Latitude, request.Longitude))
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Invalid latitude or longitude", 400);
            }

            var ride = await _unitOfWork.RideRepository.GetByIdAsync(request.RideId);
             
            if (ride == null)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Ride not found", 404);
            }
            var ridePost = await _unitOfWork.RidePostRepository.GetByDriverIdAsync(ride.DriverId);
            if (ridePost == null)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("RidePost not found", 404);
            }
            var lastLocation = await _unitOfWork.LocationUpdateRepository.GetLatestLocationByRideIdAsync(request.RideId);
            double distance = 0;
            if (lastLocation != null)
            {
                distance = await CalculateDistanceAsync(lastLocation.Latitude, lastLocation.Longitude, request.Latitude, request.Longitude);
                if (distance == 0)
                {
                    return ResponseFactory.Fail<UpdateLocationDto>("Invalid coordinates", 400);
                }
                if (distance > 100)
                {
                    return ResponseFactory.Fail<UpdateLocationDto>("Driver has gone too far", 400);
                }
                if (distance < 0.01) // 10m threshold
                {
                    return ResponseFactory.Fail<UpdateLocationDto>("No significant movement detected", 200);
                }
            }
            var userId = _userContextService.UserId();
            bool isDriver = ride.DriverId == userId; // Xác định đây là tài xế hay khách hàng
            bool isSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled; // Kiểm tra chế độ an toàn

            await _unitOfWork.BeginTransactionAsync(); // Bắt đầu transaction

            try
            {
                LocationUpdate? locationUpdate = null;

                // Nếu là tài xế hoặc khách hàng đã bật chế độ an toàn thì mới cập nhật tọa độ
                if (isDriver || isSafetyTrackingEnabled)
                {
                    if (lastLocation == null)
                    {
                        // Lần đầu tiên -> Tạo mới và lưu vào database
                        locationUpdate = new LocationUpdate(request.RideId, userId, request.Latitude, request.Longitude, isDriver);
                        await _unitOfWork.LocationUpdateRepository.AddAsync(locationUpdate);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    else
                    {
                        // Các lần sau -> Chỉ lưu vào Redis
                        locationUpdate = lastLocation;
                    }

                    if (distance > 0.05) // Chỉ gửi tọa độ lên Redis nếu đi trên 50m
                    {
                        await _redisService.AddAsync("update_location_events",
                            new UpdateLocationEvent(request.RideId, userId, request.Latitude, request.Longitude, isDriver));
                        if (ride.StartTime == null)
                        {
                            ride.UpdateStartTime();
                            await _unitOfWork.RideRepository.UpdateAsync(ride);
                        }
                       
                    }
                }

                // Nếu khách hàng không bật chế độ an toàn, chỉ tài xế mới được gửi tọa độ
                if (!isDriver && !isSafetyTrackingEnabled)
                {
                    return ResponseFactory.Fail<UpdateLocationDto>(
                        "Passenger location update ignored due to safety tracking disabled", 400);
                }

                // Lấy tọa độ điểm bắt đầu và kết thúc
                var (startLat, startLng, endLat, endLng) = await _ridePostService.GetCoordinatesAsync(ridePost.StartLocation, ridePost.EndLocation);

                // Tính khoảng cách đến đích
                double distanceToEnd = await _ridePostService.CalculateDistanceToDestinationAsync(request.Latitude, request.Longitude, ridePost.EndLocation);

                if (distanceToEnd <= 0.5) // Nếu còn <= 500m, cập nhật trạng thái chuyến đi
                {
                    ride.UpdateStatus(StatusRideEnum.Completed);
                    ride.ChangeIsSafetyTrackingEnabled(false);

                    if (locationUpdate != null)
                    {
                        locationUpdate.UpdateLocation(request.Latitude, request.Longitude);
                    }
                    await _publiser.Publish(new UpdateLocationEvent(ride.DriverId, userId,$"Chuyến đi từ {ridePost.StartLocation} đến {ridePost.EndLocation} đã hoàn thành!!" ));
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync(); // Chỉ commit một lần

                return ResponseFactory.Success(new UpdateLocationDto
                {
                    Id = locationUpdate?.Id ?? Guid.NewGuid(), // Nếu locationUpdate không tồn tại, tạo ID ngẫu nhiên
                    RideId = request.RideId,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    Timestamp = locationUpdate != null ? FormatUtcToLocal(locationUpdate.Timestamp) : DateTime.UtcNow.ToString(),
                    RideStatus = ride.Status.ToString()
                }, "Update location success", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UpdateLocationDto>("Update location failed: " + ex.Message, 500);
            }


        }

        private bool IsValidCoordinates(double latitude, double longitude)
        {
            return latitude is >= -90 and <= 90 && longitude is >= -180 and <= 180;
        }

        private async Task<double> CalculateDistanceAsync(double lat1, double lon1, double lat2, double lon2)
        {
            var (distance, _) = await _ridePostService.GetDurationAndDistanceAsync(lat1, lon1, lat2, lon2);
            return distance;
        }
    }

}
