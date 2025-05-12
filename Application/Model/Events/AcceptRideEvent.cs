using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model.Events
{
    public class AcceptRideEvent : INotification
    {

        public Guid PassengerId { get; }
        public ResponseNotificationModel Data { get; }

        public AcceptRideEvent(Guid passengerId, ResponseNotificationModel data)
        {
            PassengerId = passengerId;
            Data = data;
        }
    }
}
