using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class UpdateLocationEvent : INotification
    {
        public Guid DriverId { get; set; }
        public Guid? PassengerId { get; set; }
        public string Message { get; set; }

        public UpdateLocationEvent(Guid driverId, Guid? passengerId, string message)
        {
            DriverId = driverId;
            PassengerId = passengerId;
            Message = message;
        }
    }
}
