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
        public decimal? Fare { get;  set; }

        public CreateRideCommand(Guid driverId, int estimatedDuration, decimal? fare, Guid ridePostId)
        {
            DriverId = driverId;
            EstimatedDuration = estimatedDuration;
            Fare = fare;
            RidePostId = ridePostId;
        }
        private CreateRideCommand()
        {
        }

    }
}
