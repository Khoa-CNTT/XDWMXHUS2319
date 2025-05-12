using Application.DTOs.UpdateLocation;
using MediatR;

namespace Application.CQRS.Queries.LocationUpdate
{
    public class GetAllLocationByRideIdQueries : IRequest<ResponseModel<List<UpdateLocationDto>>>
    {
        public Guid RideId { get; set; }

        public GetAllLocationByRideIdQueries(Guid rideId)
        {
            RideId = rideId;
        }
        public GetAllLocationByRideIdQueries()
        {
        }
    }
}
