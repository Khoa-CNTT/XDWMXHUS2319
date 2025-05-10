using Application.DTOs.Ride;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Rides
{
    public class CreateRideCommand : IRequest<ResponseModel<ResponseRideDto>>
    {
        public Guid DriverId { get;  set; }
        public Guid RidePostId { get;  set; }
        public int EstimatedDuration { get;  set; }
        public bool IsSafetyTrackingEnabled { get; set; }
        public decimal? Fare { get;  set; }

        public CreateRideCommand() { }

    }
}
