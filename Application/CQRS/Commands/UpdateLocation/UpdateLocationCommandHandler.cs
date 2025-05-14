using Application.DTOs.UpdateLocation;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Application.Model.Events;
using Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

        public UpdateLocationCommandHandler(
            IUnitOfWork unitOfWork,
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
            // Kiểm tra tọa độ hợp lệ
            if (!IsValidCoordinates(request.Latitude, request.Longitude))
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Tọa độ không hợp lệ", 400);
            }

            // Lấy thông tin chuyến đi
            var ride = await _unitOfWork.RideRepository.GetByIdAsync(request.RideId);
            if (ride == null)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Không tìm thấy chuyến đi", 404);
            }
            if(ride.Status == StatusRideEnum.Completed)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Chuyến đi đã hoàn thành", 400);
            }   
            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(ride.RidePostId);
            if (ridePost == null)
            {
                return ResponseFactory.Fail<UpdateLocationDto>("Không tìm thấy bài đăng chuyến đi", 404);
            }

            var userId = _userContextService.UserId();
            bool isDriver = ride.DriverId == userId;
            bool isSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled;

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                LocationUpdate? locationUpdate = null;

                // Lấy vị trí mới nhất của người dùng hiện tại trong chuyến đi
                var lastLocation = await _unitOfWork.LocationUpdateRepository.GetListAsync(
                    x => x.RideId == request.RideId && x.UserId == userId,
                    q => q.OrderByDescending(x => x.Timestamp)
                );

                // Làm sạch request.Location để loại bỏ tiền tố sai
                string cleanLocation = request.Location;
                if (cleanLocation.Contains("Tài xế đã cập nhật vị trí tại:") || cleanLocation.Contains("Hành khách đã cập nhật vị trí tại:"))
                {
                    cleanLocation = cleanLocation
                        .Replace("Tài xế đã cập nhật vị trí tại:", "")
                        .Replace("Hành khách đã cập nhật vị trí tại:", "")
                        .Trim();
                }

                // Lưu hoặc cập nhật vị trí nếu là tài xế hoặc hành khách trong chế độ an toàn
                if (isDriver || isSafetyTrackingEnabled)
                {
                    string notificationMessage = isDriver
                            ? $"Tài xế đã cập nhật vị trí tại: {cleanLocation}"
                            : $"Hành khách đã cập nhật vị trí tại: {cleanLocation}";
                    if (lastLocation == null || !lastLocation.Any())
                    {
                        locationUpdate = new LocationUpdate(request.RideId, userId, request.Latitude, request.Longitude, isDriver);
                        await _unitOfWork.LocationUpdateRepository.AddAsync(locationUpdate);
                        // Tạo thông báo vị trí
                        // Gửi thông báo đến cả tài xế và hành khách
                        await _notificationService.SendNotificationUpdateLocationAsync(
                            ride.DriverId, // Tài xế
                            ride.PassengerId, // Hành khách
                            request.Latitude,
                            request.Longitude,
                            notificationMessage,
                            false
                        );
                    }
                    else
                    {
                        locationUpdate = lastLocation.First();
                        locationUpdate.UpdateLocation(request.Latitude, request.Longitude);
                    }

                    // Lưu sự kiện vị trí vào Redis
                    await _redisService.AddAsync("update_location_events",
                        new LocationUpdate(request.RideId, userId, request.Latitude, request.Longitude, isDriver));

                    // Gửi thông báo đến cả tài xế và hành khách
                    await _notificationService.SendNotificationUpdateLocationAsync(
                        ride.DriverId, // Tài xế
                        ride.PassengerId, // Hành khách
                        request.Latitude,
                        request.Longitude,
                        notificationMessage,
                        false
                    );

                    // Cập nhật thời gian bắt đầu nếu chưa có
                    if (ride.StartTime == null)
                    {
                        ride.UpdateStartTime();
                        await _unitOfWork.RideRepository.UpdateAsync(ride);
                    }
                }
                if (request.IsNearDestination)
                {
                    if (ride.Status != StatusRideEnum.Completed)
                    {
                        Console.WriteLine($"[Backend] Completing ride {request.RideId} at {DateTime.UtcNow}");
                        ride.UpdateStatus(StatusRideEnum.Completed);
                        await _unitOfWork.RideRepository.UpdateAsync(ride);

                        //await _notificationService.SendNotificationUpdateLocationAsync(
                        //    ride.DriverId,
                        //    ride.PassengerId,
                        //    request.Latitude,
                        //    request.Longitude,
                        //    $"Chuyến đi đã kết thúc tại: {cleanLocation}",
                        //    true
                        //);
                    }
                    else
                    {
                        Console.WriteLine($"[Backend] Ride {request.RideId} already completed, skipping notification");
                    }
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

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371e3; // Bán kính trái đất (mét)
            double φ1 = lat1 * Math.PI / 180;
            double φ2 = lat2 * Math.PI / 180;
            double Δφ = (lat2 - lat1) * Math.PI / 180;
            double Δλ = (lon2 - lon1) * Math.PI / 180;

            double a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                       Math.Cos(φ1) * Math.Cos(φ2) * Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c / 1000; // Khoảng cách tính bằng km
        }

        private double[]? ParseLatLon(string latLonString)
        {
            if (string.IsNullOrEmpty(latLonString) || latLonString == "0")
                return null;
            var parts = latLonString.Split(',');
            if (parts.Length != 2 || !double.TryParse(parts[0], out double lat) || !double.TryParse(parts[1], out double lon))
                return null;
            return new[] { lat, lon };
        }
    }
}