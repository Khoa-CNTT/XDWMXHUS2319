
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

        public DateTime? UpdatedAt { get; private set; }

        public bool IsDeleted { get; private set; } = false; // Đánh dấu bài viết đã bị xóa


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
            UpdatedAt = DateTime.UtcNow;

        }
        public void Matched()
        {
            Status = RidePostStatusEnum.Matched;
        }
        public void Canceled()
        {
            Status = RidePostStatusEnum.Canceled;
        }

        public void UpdateContent(string? content)
        {
            Content = content;
        }

        public void UpdateStartLocation(string startLocation, string latLonStart)
        {
            StartLocation = startLocation ?? throw new ArgumentNullException(nameof(startLocation));
            LatLonStart = latLonStart ?? throw new ArgumentNullException(nameof(latLonStart));
        }

        public void UpdateEndLocation(string endLocation, string latLonEnd)
        {
            EndLocation = endLocation ?? throw new ArgumentNullException(nameof(endLocation));
            LatLonEnd = latLonEnd ?? throw new ArgumentNullException(nameof(latLonEnd));
        }

        public void UpdateStartTime(DateTime startTime)
        {
            if (startTime < DateTime.UtcNow)
                throw new ArgumentException("Start time must be in the future", nameof(startTime));
            StartTime = startTime;
        }

        public void UpdatePostType(PostRideTypeEnum postType)
        {
            PostType = postType;
        }
        public void Delete()
        {
            if (!IsDeleted)
            {
                IsDeleted = true;
                Status = RidePostStatusEnum.Canceled;
            }
        }
        private void ValidateStartTime()
        {
            if (StartTime < DateTime.UtcNow)
                throw new ArgumentException("Start time must be in the future", nameof(StartTime));
        }
        public void RevertToOpen()
        {
            if (Status != RidePostStatusEnum.Canceled && !IsDeleted)
            {
                Status = RidePostStatusEnum.open;
            }
            else
            {
                throw new InvalidOperationException("Cannot revert to Open status if the post is canceled or deleted.");
            }

        }
    }
}
