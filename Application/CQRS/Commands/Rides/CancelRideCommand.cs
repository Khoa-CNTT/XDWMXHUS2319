
namespace Application.CQRS.Commands.Rides
{
    public class CancelRideCommand : IRequest<ResponseModel<bool>>
    {
        public Guid RideId { get; set; }

    }
}