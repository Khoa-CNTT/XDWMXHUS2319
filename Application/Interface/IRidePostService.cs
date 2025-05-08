using Application.DTOs.Ride;
using Application.DTOs.RidePost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTOs.RidePost.GetAllRidePostForOwnerDto;

namespace Application.Interface
{
    public interface IRidePostService
    {
        //phương thức chuyển đổi tọa độ thành địa chỉ hoặc ngược lại
        /// <summary>
        /// BE sẽ nhận StartLocation và EndLocation, kiểm tra xem dữ liệu là:

        ///Chuỗi địa chỉ → Chuyển đổi sang tọa độ bằng GoogleMapsService.GetCoordinatesAsync(address).
        ///Tọa độ(lat, lng) → Giữ nguyên.
        /// </summary>

        Task<(double startLat, double startLng, double endLat, double endLng)> GetCoordinatesAsync(string startLocation, string endLocation);
        //phương thức lấy thời gian và khoảng cách giữa 2 điểm
        Task<(double distanceKm, int durationMinutes)> GetDurationAndDistanceAsync(double startLat, double startLng, double endLat, double endLng);
        Task<(double distanceKm, int durationMinutes)> CalculateKmDurationAsync(string startLocation,string endLocation);
        //phương thức lấy quãng đường đã đi của tài xế
        Task<double> GetDriverDistanceAsync(Guid rideId);
        Task<double> CalculateDistanceToDestinationAsync(double currentLat, double currentLng, string destinationAddress);
        Task<GetAllRidePostDto> GetAllRidePostAsync(Guid? lastPostId, int pageSize);
        Task<GetAllRidePostForOwnerDto> GetAllRidePostForOwnerAsync(Guid? lastPostId, int pageSize, Guid ownerId);
        Task<GetAllRideResponseDto> GetRidePostsByDriverIdAsync(Guid driverId, Guid? lastPostId, int pageSize);
        Task<GetAllRideResponseDto> GetRidePostsByPassengerIdAsync(Guid passengerId, Guid? lastPostId, int pageSize);
        Task<GetAllRideResponseDto> GetRidesByUserIdAsync(Guid userId, Guid? lastPostId, int pageSize);
    }
}
