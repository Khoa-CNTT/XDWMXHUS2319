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
        public Guid UserId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public Guid DriverId { get; set; }
        public Guid PassengerId { get; set; }
        public bool IsDriver {  get; set; }
        public string Messsage { get; set; }
        public UpdateLocationEvent(Guid driverId,Guid passengerId,string message)
        {
            DriverId = driverId;
            PassengerId = passengerId;
            Messsage = message;
        }
    }
}
