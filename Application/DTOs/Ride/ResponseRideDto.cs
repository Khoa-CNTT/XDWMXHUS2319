using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;
using static Domain.Common.Helper;

namespace Application.DTOs.Ride
{
    public class ResponseRideDto
    {
        public Guid Id { get; set; }
        public Guid DriverId { get; set; }
        public Guid PassengerId { get; set; }
        public Guid RidePostId { get; set; }
        public required string? StartTime { get; set; }
        public required string? EndTime { get; set; }
        public required string CreatedAt { get; set; }
        public int EstimatedDuration { get; set; }
        public bool isSelf { get; set; }
        public StatusRideEnum Status { get; set; }
        public decimal Fare { get; set; }



    }

}
