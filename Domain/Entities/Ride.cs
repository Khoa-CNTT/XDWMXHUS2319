using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Ride
    {
        public Guid Id { get; private set; }
        public Guid DriverId { get; private set; }
        public Guid PassengerId { get; private set; }
        public Guid RidePostId { get; private set; }
        public DateTime? StartTime { get; private set; }
        public DateTime? EndTime { get; private set; }
        public int EstimatedDuration { get; private set; }
        public StatusRideEnum Status { get; private set; } = StatusRideEnum.Accepted;
        public decimal? Fare { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public bool IsSafetyTrackingEnabled { get; private set; } = false;
        public RidePost? RidePost { get;private set; }
        public User? Driver { get; private set; }
        public User? Passenger { get; private set; }
        public ICollection<LocationUpdate>? LocationUpdates { get; private set; }
        public Ride(Guid driverId, Guid passengerId, decimal? fare, int estimatedDuration, Guid ridePostId,bool isSafetyTrackingEnabled)
        {
            Id = Guid.NewGuid();
            DriverId = driverId;
            PassengerId = passengerId;
            EstimatedDuration = estimatedDuration;
            IsSafetyTrackingEnabled = isSafetyTrackingEnabled;
            Fare = fare ?? 0;
            CreatedAt = DateTime.UtcNow;
            RidePostId = ridePostId;
        }

        public void UpdateStatus(StatusRideEnum status)
        {
            Status = status;
        }
        public void UpdateStartTime()
        {
            if (StartTime == null)
            {
                StartTime = DateTime.UtcNow;
                UpdateEndTime(StartTime);
            }
        }
        public void ChangeIsSafetyTrackingEnabled(bool isSafetyTrackingEnabled)
        {
            IsSafetyTrackingEnabled = isSafetyTrackingEnabled;
        }

        private void UpdateEndTime(DateTime? startTime)
        {
            if (startTime.HasValue) // Kiểm tra nếu startTime có giá trị
            {
                EndTime = startTime.Value.AddMinutes(EstimatedDuration);
            }
        }


    }
}
