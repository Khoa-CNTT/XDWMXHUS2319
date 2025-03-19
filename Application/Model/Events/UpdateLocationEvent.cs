using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class UpdateLocationEvent : INotification
    {
        public Guid RideId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Guid DriverId { get; set; }
        public Guid PassengerId { get; set; }
        public UpdateLocationEvent(Guid driverId,Guid passengerId)
        {
            DriverId = driverId;
            PassengerId = passengerId;
        }
        public UpdateLocationEvent(Guid rideId, double latitude, double longitude)
        {
            RideId = rideId;
            Latitude = latitude;
            Longitude = longitude;
        }
    }
}
