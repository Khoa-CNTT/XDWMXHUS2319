﻿using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Rating
    {
        public Guid Id { get;private set; }
        public Guid UserId { get; private set; }  // Người được đánh giá
        public Guid RatedByUserId { get; private set; } // Người đánh giá
        public Guid RideId { get; private set; } // Chuyến đi được đánh giá
        public RatingLevelEnum Level { get; private set; } // Mức độ đánh giá
        public string? Comment { get; private set; } // Bình luận (nếu có)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Rating(Guid id, Guid userId, Guid ratedByUserId, Guid rideId, RatingLevelEnum level, string? comment)
        {
            Id = id;
            UserId = userId;
            RatedByUserId = ratedByUserId;
            RideId = rideId;
            Level = level;
            Comment = comment;
            CreatedAt = DateTime.UtcNow;
        }
        public void UpdateComment(string comment)
        {
            Comment = comment;
        }
        public void UpdateLevel(RatingLevelEnum level)
        {
            Level = level;
        }
    }
}
