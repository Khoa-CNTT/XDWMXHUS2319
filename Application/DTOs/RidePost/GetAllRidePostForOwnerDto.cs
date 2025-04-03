using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.RidePost
{
    public class GetAllRidePostForOwnerDto
    {
        
            public List<RidePostDto> RidePosts { get; set; } = new();
            public Guid? NextCursor { get; set; } // ID của bài viết cuối cùng trong danh sách (dùng cho lần request tiếp theo)
        

        public class RidePostDto
        {
            public Guid Id { get; set; }
            public Guid UserId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string StartLocation { get; set; } = string.Empty;
            public string EndLocation { get; set; } = string.Empty;
            public string? LatLonStart { get; set; }
            public string? LatLonEnd { get; set; }
            public string StartTime { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string CreatedAt { get; set; } = string.Empty;
            public RideDto? Ride { get; set; }
        }

        public class RideDto
        {
            public Guid Id { get; set; }
            public string DriverName { get; set; } = string.Empty;
            public string PassengerName { get; set; } = string.Empty;
            public string? StartTime { get; set; }
            public string? EndTime { get; set; } 
            public int EstimatedDistance { get; set; }
            public required string Status { get; set; }
            public decimal? Fare { get; set; }
            public string CreatedAt { get; set; } = string.Empty;
            public bool IsTracking { get; set; }

        }

       
    }
}
