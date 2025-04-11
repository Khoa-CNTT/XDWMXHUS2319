using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class RidePost
    {
        public Guid Id { get;private set; }
        public Guid UserId { get; private set; }
        public string? Content { get; private set; }
        public string StartLocation { get; private set; }
        public string EndLocation { get; private set; }
        public string LatLonStart { get; private set; }
        public string LatLonEnd { get; private set; }

        public DateTime StartTime { get; private set; }
        public PostRideTypeEnum PostType { get; private set; }
        public RidePostStatusEnum Status { get; private set; } = RidePostStatusEnum.open;
        public DateTime CreatedAt { get; private set; }
        public User? User { get;private set; }
        public Ride? Ride { get;private set; } // Quan hệ 1-1 với Ride (nếu có người ghép chuyến)
        public RidePost(Guid userId,string? content, string startLocation, string endLocation, string latLonStart, string latLonEnd, DateTime startTime, PostRideTypeEnum postType)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Content = content;
            StartLocation = startLocation;
            EndLocation = endLocation;
            LatLonStart = latLonStart;
            LatLonEnd = latLonEnd;
            StartTime = startTime;
            PostType = postType;
            CreatedAt = DateTime.UtcNow;
        }
        public void UpdateRidePost(string startLocation, string endLocation, DateTime startTime)
        {
            StartLocation = startLocation;
            EndLocation = endLocation;
            StartTime = startTime;
        }
        public void Matched()
        {
            Status = RidePostStatusEnum.Matched;
        }
        public void Canceled()
        {
            Status = RidePostStatusEnum.Canceled;
        }
    }
}
