using Application.DTOs.UpdateLocation;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
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
        private readonly IRedisService _redisService;
        private readonly IUserContextService _userContextService;
        private readonly INotificationService _notificationService;

        public UpdateLocationCommandHandler(IUnitOfWork unitOfWork,
            IRedisService redisService,
            IUserContextService userContextService,
            INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _redisService = redisService;
            _userContextService = userContextService;
            _notificationService = notificationService;
        }

        public async Task<ResponseModel<UpdateLocationDto>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
        {
            if (!IsValidCoordinates(request.Latitude, request.Longitude))
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Tọa độ không hợp lệ", 400);
            }

            var ride = await _unitOfWork.RideRepository.GetByIdAsync(request.RideId);
            if (ride == null)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Không tìm thấy chuyến đi", 404);
            }

            var userId = _userContextService.UserId();
            bool isDriver = ride.DriverId == userId;
            bool isSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled;

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                LocationUpdate? locationUpdate = null;
                var lastLocation = await _unitOfWork.LocationUpdateRepository.GetLatestLocationByRideIdAsync(request.RideId);

                if (isDriver || isSafetyTrackingEnabled)
                {
                    if (lastLocation == null)
                    {
                        locationUpdate = new LocationUpdate(request.RideId, userId, request.Latitude, request.Longitude, isDriver);
                        await _unitOfWork.LocationUpdateRepository.AddAsync(locationUpdate);
                        await _unitOfWork.SaveChangesAsync();
                    }
                    else
                    {
                        locationUpdate = lastLocation;
                    }

                    await _redisService.AddAsync("update_location_events",
                        new LocationUpdate(request.RideId, userId, request.Latitude, request.Longitude, isDriver));
                    await _notificationService.SendNotificationUpdateLocationAsync(
                        ride.DriverId,
                        ride.PassengerId,
                        request.Latitude,
                        request.Longitude,
                        request.Location, // Sử dụng location từ client
                        false
                    );

                    if (ride.StartTime == null)
                    {
                        ride.UpdateStartTime();
                        await _unitOfWork.RideRepository.UpdateAsync(ride);
                    }
                }

                if (request.IsNearDestination)
                {
                    ride.UpdateStatus(StatusRideEnum.Completed);
                    ride.ChangeIsSafetyTrackingEnabled(false);
                    if (locationUpdate != null)
                    {
                        locationUpdate.UpdateLocation(request.Latitude, request.Longitude);
                    }
                    await _notificationService.SendNotificationUpdateLocationAsync(
                        ride.DriverId,
                        ride.PassengerId,
                        request.Latitude,
                        request.Longitude,
                        request.Location, // Sử dụng location từ client
                        true
                    );
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(new UpdateLocationDto
                {
                    Id = locationUpdate?.Id ?? Guid.NewGuid(),
                    RideId = request.RideId,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    Timestamp = locationUpdate != null ? FormatUtcToLocal(locationUpdate.Timestamp) : DateTime.UtcNow.ToString(),
                    RideStatus = ride.Status.ToString()
                }, "Cập nhật vị trí thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<UpdateLocationDto>("Cập nhật vị trí thất bại: " + ex.Message, 500);
            }
        }

        private bool IsValidCoordinates(double latitude, double longitude)
        {
            return latitude is >= -90 and <= 90 && longitude is >= -180 and <= 180;
        }
    }

}
