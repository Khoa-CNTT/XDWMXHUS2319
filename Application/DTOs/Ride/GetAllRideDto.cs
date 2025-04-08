using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Ride
{
    public class GetAllRideDto
    {
        public Guid RidePostId { get; set; }
        public Guid RideId { get; set; }
        public Guid PassengerId { get; set; }
        public Guid DriverId { get; set; }
        public string StartLocation { get; set; } = string.Empty;
        public string EndLocation { get; set; } = string.Empty;
        public string? StartTime { get; set; } = string.Empty;
        public string? EndTime { get; set; } = string.Empty;
        public string LatLonStart { get; set; } = string.Empty;
        public string LatLonEnd { get; set; } = string.Empty;
        
        public int EstimatedDuration { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CreateAt { get; set; } = string.Empty;
        public bool IsSafe { get; set; }

    }
    public class GetAllRideResponseDto
    {
        public List<GetAllRideDto> DriverRideList { get; set; } = new List<GetAllRideDto>();
        public List<GetAllRideDto> PassengerRideList { get; set; } = new List<GetAllRideDto>();
        public Guid? DriverNextCursor { get; set; }
        public Guid? PassengerNextCursor { get; set; }
    }
}
