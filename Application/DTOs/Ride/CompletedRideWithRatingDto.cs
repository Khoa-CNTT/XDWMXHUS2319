using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Ride
{
    public class CompletedRideWithRatingDto
    {
        public Guid RideId { get; set; }
        public Guid RidePostId { get; set; }
        public string? Content { get; set; }
        public string? StartLocation { get; set; }
        public string? EndLocation { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime CreatedAt { get; set; }

        public DriverInfoDto? Driver { get; set; }
        public RatingInfoDto? Rating { get; set; }
    }

    public class DriverInfoDto
    {
        public Guid DriverId { get; set; }
        public string? Fullname { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class RatingInfoDto
    {
        public int Level { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        public RatedByUserDto? RatedByUser { get; set; }
    }

    public class RatedByUserDto
    {
        public Guid RatedByUserId { get; set; }
        public string? Fullname { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
