﻿using Application.DTOs.Ride;
using static Domain.Common.Helper;
using Application.Interface.ContextSerivce;
using Domain.Entities;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Rides
{
    public class CreateRideCommandHandler : IRequestHandler<CreateRideCommand, ResponseModel<ResponseRideDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRidePostService _ridePostService;
        public CreateRideCommandHandler(IUserContextService userContextService, IUnitOfWork unitOfWork, IRidePostService ridePostService)
        {
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _ridePostService = ridePostService;
        }
        public async Task<ResponseModel<ResponseRideDto>> Handle(CreateRideCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
                return ResponseFactory.Fail<ResponseRideDto>("User not found", 404);
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
                return ResponseFactory.Fail<ResponseRideDto>("Người dùng không tồn tại", 404);
            if (user.Status == "Suspended")
                return ResponseFactory.Fail<ResponseRideDto>("Tài khoản đang bị tạm ngưng", 403);

            var ridePost = await _unitOfWork.RidePostRepository.GetByIdAsync(request.RidePostId);

            if (userId == request.DriverId)
            {
                return ResponseFactory.Fail<ResponseRideDto>("Bạn không thể tự đăng kí chuyến đi của bạn.", 400);
            }

            if (ridePost == null || ridePost.Status == RidePostStatusEnum.Matched)
            {
                return ResponseFactory.Fail<ResponseRideDto>("Post doesn't exist or it is matched", 404);
            }

            // ⚠️ Kiểm tra tài xế đang có chuyến đi active không?
            var driverActiveRides = await _unitOfWork.RideRepository.GetActiveRidesByDriverIdAsync(request.DriverId);
            if (driverActiveRides.Any())
            {
                return ResponseFactory.Fail<ResponseRideDto>("Driver already has an active ride. Please wait for it to complete.", 400);
            }

            // Kiểm tra các chuyến đi đang active của hành khách
            var activeRides = await _unitOfWork.RideRepository.GetActiveRidesByPassengerIdAsync(userId);
            if (activeRides.Any())
            {
                return ResponseFactory.Fail<ResponseRideDto>("You already have an active ride. Please complete it before registering a new one.", 400);
            }
            (double distanceKm, int durationMinutes) = await _ridePostService.CalculateKmDurationAsync(ridePost.StartLocation, ridePost.EndLocation);
            if (distanceKm == 0 && durationMinutes == 0)
            {
                return ResponseFactory.Fail<ResponseRideDto>("Ride post not found", 404);
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (request.EstimatedDuration == 0)
                {
                    var startCoords = ridePost.LatLonStart.Split(',');
                    var endCoords = ridePost.LatLonEnd.Split(',');

                    var startLat = double.Parse(startCoords[0]);
                    var startLng = double.Parse(startCoords[1]);
                    var endLat = double.Parse(endCoords[0]);
                    var endLng = double.Parse(endCoords[1]);

                    var (_, estimatedDuration) = await _ridePostService.GetDurationAndDistanceAsync(startLat, startLng, endLat, endLng);

                    // Gán lại vào request nếu cần
                    request.EstimatedDuration = estimatedDuration;
                }
                ridePost.Matched();
                var ride = new Ride(request.DriverId, userId, request.Fare, durationMinutes, request.RidePostId,request.IsSafetyTrackingEnabled);
                await _unitOfWork.RideRepository.AddAsync(ride);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                var rideDto = new ResponseRideDto
                {
                    Id = ride.Id,
                    DriverId = ride.DriverId,
                    PassengerId = userId,
                    RidePostId = ride.RidePostId,
                    StartTime = ride.StartTime.HasValue
                    ? FormatUtcToLocal(ride.StartTime.Value) : null,
                    CreatedAt = FormatUtcToLocal(ride.CreatedAt),
                    EndTime = ride.EndTime.HasValue ? FormatUtcToLocal(ride.EndTime.Value) : null,
                    EstimatedDuration = ride.EstimatedDuration,
                    Fare = ride.Fare ?? 0,
                    Status = ride.Status,
                    isSelf = ride.IsSafetyTrackingEnabled,
                };
                return ResponseFactory.Success(rideDto, "Create Ride Success", 200);
            }
            catch (Exception e)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResponseRideDto>(e.Message, 500);
            }
        }

    }
    
}
