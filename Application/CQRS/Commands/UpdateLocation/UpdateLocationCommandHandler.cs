using Application.DTOs.UpdateLocation;
using Application.Model.Events;
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

        public UpdateLocationCommandHandler(IUnitOfWork unitOfWork, 
            IRidePostService ridePostService,
            IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _ridePostService = ridePostService;
            _redisService = redisService;

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

                // Bắt đầu transaction vì có thay đổi dữ liệu
                await _unitOfWork.BeginTransactionAsync();
            try
            {
                var locationUpdate = new LocationUpdate(Guid.Empty,0,0);
                if (lastLocation == null)
                {
                    locationUpdate = new LocationUpdate(request.RideId, request.Latitude, request.Longitude);
                    await _unitOfWork.LocationUpdateRepository.AddAsync(locationUpdate);
                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();
                }
                if (distance > 0.05) // Chỉ tạo locationUpdate khi đi được trên 50m
                {
                    await _redisService.AddAsync("update_location_events", new UpdateLocationEvent(request.RideId, request.Latitude, request.Longitude));
                }
                // Lấy tọa độ điểm bắt đầu và điểm kết thúc của RidePost
                var (startLat, startLng, endLat, endLng) = await _ridePostService.GetCoordinatesAsync(ridePost.StartLocation , ridePost.EndLocation);

                // Tính khoảng cách giữa vị trí tài xế hiện tại và tọa độ đích
                double distanceToEnd = await _ridePostService.CalculateDistanceToDestinationAsync(request.Latitude, request.Longitude, ridePost.EndLocation);
                // Nếu khoảng cách <= 500m, cập nhật trạng thái chuyến đi
                if (distanceToEnd <= 0.5) // 500m
                {
                    ride.UpdateStatus(StatusRideEnum.Completed);
                    locationUpdate.UpdateLocation(request.Latitude, request.Longitude);
                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();
                }
                return ResponseFactory.Success(new UpdateLocationDto
                {
                    Id = locationUpdate.Id,
                    RideId = request.RideId,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    Timestamp = FormatUtcToLocal(locationUpdate.Timestamp),
                    RideStatus = ride.Status.ToString()
                }, "Update location success", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UpdateLocationDto>("Update location failed"+ex, 500);
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
