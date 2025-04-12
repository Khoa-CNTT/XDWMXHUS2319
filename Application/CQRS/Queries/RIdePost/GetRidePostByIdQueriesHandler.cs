using static Domain.Common.Helper;
using static Application.DTOs.RidePost.GetAllRidePostForOwnerDto;
using System.Text;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetRidePostByIdQueriesHandler : IRequestHandler<GetRidePostByIdQueries, ResponseModel<RidePostDto>>
    {
        private readonly IRidePostRepository _ridePostRepository;
        public GetRidePostByIdQueriesHandler(IRidePostRepository ridePostRepository)
        {
            _ridePostRepository = ridePostRepository;
        }
        public async Task<ResponseModel<RidePostDto>> Handle(GetRidePostByIdQueries request, CancellationToken cancellationToken)
        {
           
            var ridePost = await _ridePostRepository.GetByIdAsync(request.Id);
            if (ridePost == null)
            {
                return ResponseFactory.Fail<RidePostDto>("RidePost not found", 404);
            }
            var ridePostDto = new RidePostDto
            {
                Id = ridePost.Id,
                UserId = ridePost.UserId,
                StartLocation = ridePost.StartLocation,
                EndLocation = ridePost.EndLocation,
                LatLonStart = ridePost.LatLonStart,
                LatLonEnd = ridePost.LatLonEnd,
                StartTime =FormatUtcToLocal(ridePost.StartTime),
                Status =ridePost.Status.ToString(),
                CreatedAt =FormatUtcToLocal(ridePost.CreatedAt),
            };
            return ResponseFactory.Success(ridePostDto,"Get ride post success",200);
        }
    }
}
