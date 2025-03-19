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
        public string StartLocation { get; private set; }
        public string EndLocation { get; private set; }
        public DateTime StartTime { get; private set; }
        public PostRideTypeEnum PostType { get; private set; }
        public RidePostStatusEnum Status { get; private set; } = RidePostStatusEnum.open;
        public DateTime CreatedAt { get; private set; }
        public User? User { get;private set; }
        public Ride? Ride { get;private set; } // Quan hệ 1-1 với Ride (nếu có người ghép chuyến)
        public RidePost(Guid userId, string startLocation, string endLocation, DateTime startTime, PostRideTypeEnum postType)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            StartLocation = startLocation;
            EndLocation = endLocation;
            StartTime = startTime;
            PostType = postType;
            CreatedAt = DateTime.UtcNow;
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
