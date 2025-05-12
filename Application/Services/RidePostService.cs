using Application.DTOs.RidePost;
using static Domain.Common.Helper;
using Application.Interface.Api;
using static Application.DTOs.RidePost.GetAllRidePostForOwnerDto;
using Application.DTOs.Ride;



namespace Application.Services
{
    public class RidePostService : IRidePostService
    {
        private readonly IMapService _mapService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        public RidePostService(IMapService mapService, IUnitOfWork unitOfWork, ICacheService cacheService)
        {
            _mapService = mapService;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }
        public async Task<(double startLat, double startLng, double endLat, double endLng)> GetCoordinatesAsync(string startLocation, string endLocation)
        {
            // Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrWhiteSpace(startLocation) || string.IsNullOrWhiteSpace(endLocation))
            {
                throw new ArgumentException("StartLocation và EndLocation không được để trống.");
            }

            double startLat, startLng, endLat, endLng;

            // Kiểm tra xem dữ liệu là tọa độ hay địa chỉ
            if (IsCoordinate(startLocation))
            {
                var startCoords = ParseCoordinates(startLocation);
                startLat = startCoords.lat;
                startLng = startCoords.lng;
            }
            else
            {
                var startCoords = await _mapService.GetCoordinatesAsync(startLocation);
                startLat = startCoords.lat;
                startLng = startCoords.lng;
            }

            if (IsCoordinate(endLocation))
            {
                var endCoords = ParseCoordinates(endLocation);
                endLat = endCoords.lat;
                endLng = endCoords.lng;
            }
            else
            {
                var endCoords = await _mapService.GetCoordinatesAsync(endLocation);
                endLat = endCoords.lat;
                endLng = endCoords.lng;
            }

            return (startLat, startLng, endLat, endLng);
        }

        public async Task<(double distanceKm, int durationMinutes)> GetDurationAndDistanceAsync(double startLat, double startLng, double endLat, double endLng)
        {
            // Kiểm tra tọa độ hợp lệ
            bool IsValidCoordinate(double lat, double lng) =>
                !double.IsNaN(lat) && !double.IsNaN(lng) && !double.IsInfinity(lat) && !double.IsInfinity(lng) &&
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

            if (!IsValidCoordinate(startLat, startLng) || !IsValidCoordinate(endLat, endLng) ||
                (startLat == endLat && startLng == endLng))
            {
                return (0, 0);
            }

            return await _mapService.GetDistanceAndTimeAsync($"{startLat},{startLng}", $"{endLat},{endLng}");
        }



        // Hàm kiểm tra xem chuỗi có phải tọa độ không
        private bool IsCoordinate(string input)
        {
            var parts = input.Split(',');
            if (parts.Length != 2) return false;

            return double.TryParse(parts[0], out _) && double.TryParse(parts[1], out _);
        }

        // Hàm tách chuỗi tọa độ
        private (double lat, double lng) ParseCoordinates(string input)
        {
            var parts = input.Split(',');
            return (double.Parse(parts[0]), double.Parse(parts[1]));
        }

        //sử dụng 2 phương thức trên để tính toán khoảng cách và thời gian dự kiến giữa 2 điểm
        public async Task<(double distanceKm, int durationMinutes)> CalculateKmDurationAsync(string startLocation,string endLocation)
        {
            var (startLat, startLng, endLat, endLng) = await GetCoordinatesAsync(startLocation, endLocation);
            return await GetDurationAndDistanceAsync(startLat, startLng, endLat, endLng);
        }
        //phương thức tính toán khoảng cách khi tài xế đến điển EndLocation
        public async Task<double> CalculateDistanceToDestinationAsync(double currentLat, double currentLng, string destinationAddress)
        {
            var (_, _, endLat, endLng) = await GetCoordinatesAsync(destinationAddress, destinationAddress);

            return CalculateDistance(currentLat, currentLng, endLat, endLng);
        }

        //phương thức lấy quãng đường đã đi của tài xế khi đang chạy
        public async Task<(double distanceKm, int durationMinutes)> CalculateKmDurationAsync(
         double startLat, double startLng, double endLat, double endLng)
        {
            return await GetDurationAndDistanceAsync(startLat, startLng, endLat, endLng);
        }

        //phương thức lấy quãng đường đã đi của tài xế
        public async Task<double> GetDriverDistanceAsync(Guid rideId)
        {
            if (rideId == Guid.Empty)
            {
                throw new ArgumentException("RideId không hợp lệ.");
            }

            // Lấy dữ liệu trong 30 phút gần nhất
            var locations = await _unitOfWork.LocationUpdateRepository
                        .GetListAsync(rt => rt.RideId == rideId && rt.Timestamp >= DateTime.UtcNow.AddMinutes(-30),
                        q => q.OrderBy(t => t.Timestamp));

            return CalculateTotalDistanceTraveled(locations);
        }

        // Hàm tính tổng quãng đường đã đi
        private double CalculateTotalDistanceTraveled(List<LocationUpdate> locations)
        {
            if (locations == null || locations.Count < 2) return 0;

            double totalDistance = 0;
            double minDistanceThreshold = 0.01; // Giới hạn khoảng cách 10m

            for (int i = 1; i < locations.Count; i++)
            {
                double distance = CalculateDistance(
                    locations[i - 1].Latitude, locations[i - 1].Longitude,
                    locations[i].Latitude, locations[i].Longitude
                );

                if (distance > minDistanceThreshold) // Chỉ tính nếu khoảng cách lớn hơn 10m
                {
                    totalDistance += distance;
                }
            }

            return totalDistance;
        }

        // Hàm tính khoảng cách giữa 2 điểm
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // Bán kính Trái Đất (km)
            double dLat = (lat2 - lat1) * Math.PI / 180;
            double dLon = (lon2 - lon1) * Math.PI / 180;

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c; // Khoảng cách (km)
        }

        public async Task<GetAllRidePostDto> GetAllRidePostAsync(Guid? lastPostId, int pageSize)
        {
            var ridePosts = await _unitOfWork.RidePostRepository.GetAllRidePostAsync(lastPostId, pageSize);
            var result = ridePosts.Select(x => new ResponseRidePostDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User?.FullName ?? "unknown",
                UserAvatar = $"{Constaint.baseUrl}{x.User?.ProfilePicture}" ?? "unknown",
                Content = x.Content,
                StartLocation = x.StartLocation,
                EndLocation = x.EndLocation,
                LatLonStart = x.LatLonStart,
                LatLonEnd = x.LatLonEnd,
                StartTime =x.StartTime.ToString(),
                Status = x.Status,
                CreatedAt =FormatUtcToLocal(x.CreatedAt)
            }).ToList();
            var nextCursor = result.Count > 0 ? (Guid?)result.Last().Id : null;
            return new GetAllRidePostDto
            {
                ResponseRidePostDto = result,
                NextCursor = nextCursor
            };
        }
        public async Task<GetAllRideResponseDto> GetRidePostsByDriverIdAsync(Guid driverId, Guid? lastPostId, int pageSize)
        {
            var ridePosts = await _unitOfWork.RideRepository.GetRidePostsByDriverIdAsync(driverId, lastPostId, pageSize);
            var result = new List<GetAllRideDto>();

            foreach (var ride in ridePosts)
            {
                var (start, end, locationStart,locationEnd) = await _unitOfWork.RidePostRepository.GetLatLonByRidePostIdAsync(ride.RidePostId);

                result.Add(new GetAllRideDto
                {
                    RidePostId = ride.RidePostId,
                    PassengerId = ride.PassengerId,
                    DriverId = ride.DriverId,
                    RideId = ride.Id,
                    StartTime = FormatUtcToLocal(ride.StartTime ?? DateTime.UtcNow),
                    EndTime = FormatUtcToLocal(ride.EndTime ?? DateTime.UtcNow),
                    LatLonStart = start,
                    EndLocation = locationEnd,
                    StartLocation = locationStart,
                    LatLonEnd = end,
                    CreateAt = FormatUtcToLocal(ride.CreatedAt),
                    EstimatedDuration = ride.EstimatedDuration,
                    Status = ride.Status.ToString(),
                    IsSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled
                });
            }
            var nextCursor = result.Count > 0 ? (Guid?)result.Last().RideId : null;
            return new GetAllRideResponseDto
            {
                DriverRideList = result,
                DriverNextCursor = nextCursor
            };
        }
        public async Task<GetAllRideResponseDto> GetRidePostsByPassengerIdAsync(Guid passengerId, Guid? lastPostId, int pageSize)
        {
            var ridePosts = await _unitOfWork.RideRepository.GetRidePostsByPassengerIdAsync(passengerId, lastPostId, pageSize);

            var result = new List<GetAllRideDto>();

            foreach (var ride in ridePosts)
            {
                var (start, end,startL,EndL) = await _unitOfWork.RidePostRepository.GetLatLonByRidePostIdAsync(ride.RidePostId);

                result.Add(new GetAllRideDto
                {
                    RidePostId = ride.RidePostId,
                    PassengerId = ride.PassengerId,
                    DriverId = ride.DriverId,
                    RideId = ride.Id,
                    StartLocation = startL,
                    EndLocation = EndL,
                    StartTime = FormatUtcToLocal(ride.StartTime ?? DateTime.UtcNow),
                    EndTime = FormatUtcToLocal(ride.EndTime ?? DateTime.UtcNow),
                    LatLonStart = start,
                    LatLonEnd = end,
                    CreateAt = FormatUtcToLocal(ride.CreatedAt),
                    EstimatedDuration = ride.EstimatedDuration,
                    Status = ride.Status.ToString(),
                    IsSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled
                });
            }

            var nextCursor = result.Count > 0 ? (Guid?)result.Last().RideId : null;

            return new GetAllRideResponseDto
            {
                PassengerRideList = result,
                PassengerNextCursor = nextCursor
            };
        }
        public async Task<GetAllRideResponseDto> GetRidesByUserIdAsync(Guid userId, Guid? lastPostId, int pageSize)
        {
            // Lấy rides mà userId là driver
            var driverRidePosts = await _unitOfWork.RideRepository.GetRidePostsByDriverIdAsync(userId, lastPostId, pageSize);
            // Lấy rides mà userId là passenger
            var passengerRidePosts = await _unitOfWork.RideRepository.GetRidePostsByPassengerIdAsync(userId, lastPostId, pageSize);

            var driverRides = new List<GetAllRideDto>();
            var passengerRides = new List<GetAllRideDto>();

            // Xử lý rides của driver
            foreach (var ride in driverRidePosts)
            {
                var (start, end, locationStart, locationEnd) = await _unitOfWork.RidePostRepository.GetLatLonByRidePostIdAsync(ride.RidePostId);
                // Kiểm tra xem chuyến đi đã được đánh giá bởi passenger chưa
                bool hasRating = ride.PassengerId != Guid.Empty && await _unitOfWork.RatingRepository
                     .AnyAsync(r => r.RideId == ride.Id && r.RatedByUserId == ride.PassengerId && r.UserId == ride.DriverId);
                driverRides.Add(new GetAllRideDto
                {
                    RidePostId = ride.RidePostId,
                    PassengerId = ride.PassengerId,
                    DriverId = ride.DriverId,
                    RideId = ride.Id,
                    StartTime = FormatUtcToLocal(ride.StartTime ?? DateTime.UtcNow),
                    EndTime = FormatUtcToLocal(ride.EndTime ?? DateTime.UtcNow),
                    LatLonStart = start,
                    LatLonEnd = end,
                    StartLocation = locationStart,
                    EndLocation = locationEnd,
                    CreateAt = FormatUtcToLocal(ride.CreatedAt),
                    EstimatedDuration = ride.EstimatedDuration,
                    Status = ride.Status.ToString(),
                    IsSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled,
                    IsRating = hasRating
                });
            }

            // Xử lý rides của passenger
            foreach (var ride in passengerRidePosts)
            {
                var (start, end, startL, endL) = await _unitOfWork.RidePostRepository.GetLatLonByRidePostIdAsync(ride.RidePostId);
                // Kiểm tra xem passenger đã đánh giá chuyến đi chưa
                bool hasRating = await _unitOfWork.RatingRepository
                      .AnyAsync(r => r.RideId == ride.Id && r.RatedByUserId == ride.PassengerId && r.UserId == ride.DriverId);

                passengerRides.Add(new GetAllRideDto
                {
                    RidePostId = ride.RidePostId,
                    PassengerId = ride.PassengerId,
                    DriverId = ride.DriverId,
                    RideId = ride.Id,
                    StartTime = FormatUtcToLocal(ride.StartTime ?? DateTime.UtcNow),
                    EndTime = FormatUtcToLocal(ride.EndTime ?? DateTime.UtcNow),
                    LatLonStart = start,
                    LatLonEnd = end,
                    StartLocation = startL,
                    EndLocation = endL,
                    CreateAt = FormatUtcToLocal(ride.CreatedAt),
                    EstimatedDuration = ride.EstimatedDuration,
                    Status = ride.Status.ToString(),
                    IsSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled,
                    IsRating = hasRating
                });
            }

            // Tính nextCursor cho từng loại rides
            var driverNextCursor = driverRides.Count > 0 ? (Guid?)driverRides.Last().RideId : null;
            var passengerNextCursor = passengerRides.Count > 0 ? (Guid?)passengerRides.Last().RideId : null;

            return new GetAllRideResponseDto
            {
                DriverRideList = driverRides,       // Danh sách rides mà user là driver
                PassengerRideList = passengerRides, // Danh sách rides mà user là passenger
                DriverNextCursor = driverNextCursor,
                PassengerNextCursor = passengerNextCursor
            };
        }

        public async Task<GetAllRidePostForOwnerDto> GetAllRidePostForOwnerAsync(Guid? lastPostId, int pageSize, Guid ownerId)
        {
            // Lấy danh sách 10 bài mới từ DB
            var ridePosts = await _unitOfWork.RidePostRepository.GetAllRidePostForOwnerAsync(lastPostId, pageSize, ownerId);

            // Lấy danh sách PassengerName trước khi mapping
            var passengerNames = await Task.WhenAll(ridePosts
                .Where(x => x.Ride?.PassengerId != null)
                .Select(async x => new
                {
                    RideId = x.Ride!.Id,
                    PassengerName = await _unitOfWork.UserRepository.GetFullNameByIdAsync(x.Ride.PassengerId!)
                })
            );
            var result = ridePosts.Select(x => new RidePostDto
            {
                Id = x.Id,
                FullName = x.User?.FullName ?? "unknown",
                StartLocation = x.StartLocation,
                EndLocation = x.EndLocation,
                LatLonStart = x.LatLonStart,
                LatLonEnd = x.LatLonEnd,
                StartTime = FormatUtcToLocal(x.StartTime),
                Status = x.Status.ToString(),
                CreatedAt = FormatUtcToLocal(x.CreatedAt),
                Ride = x.Ride != null ? new RideDto
                {
                    Id = x.Ride.Id,
                    DriverName = x.Ride.Driver?.FullName ?? "unknown",
                    PassengerName = passengerNames.FirstOrDefault(p => p.RideId == x.Ride.Id)?.PassengerName ?? "unknown",
                    StartTime = x.Ride.StartTime.HasValue ? FormatUtcToLocal(x.Ride.StartTime.Value) : null,
                    EndTime = x.Ride.EndTime.HasValue ? FormatUtcToLocal(x.Ride.EndTime.Value) : null,
                    EstimatedDistance = x.Ride.EstimatedDuration,
                    Status = x.Ride.Status.ToString(),
                    Fare = x.Ride.Fare,
                    CreatedAt = FormatUtcToLocal(x.Ride.CreatedAt)
                } : null
            }).ToList();

            var nextCursor = result.Any() ? (Guid?)result.Last().Id : null;

            return new GetAllRidePostForOwnerDto
            {
                RidePosts = result,
                NextCursor = nextCursor
            };
        }


    }
}
