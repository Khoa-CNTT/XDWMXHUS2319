using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class RideReport
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid RideId { get; private set; }
        public Guid PassengerId { get; private set; }
        public string Message { get; private set; }
        public AlertTypeEnums AlertType { get; private set; }
        public bool Status { get; private set; } = false;
        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
        public User? Passenger { get; private set; }
        public RideReport(Guid rideId, Guid passengerId, AlertTypeEnums alertType, string message)
        {
            RideId = rideId;
            PassengerId = passengerId;
            AlertType = alertType;
            Message = message;
        }
    }

}
