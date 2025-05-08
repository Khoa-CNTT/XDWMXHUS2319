using Application.DTOs.RidePost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetAllRidePostQueryHandler : IRequestHandler<GetAllRidePostQuery, ResponseModel<GetAllRidePostDto>>
    {
       private readonly IRidePostService _ridePostService;
        public GetAllRidePostQueryHandler(IRidePostService ridePostService)
        {
            _ridePostService = ridePostService;
        }
        public async Task<ResponseModel<GetAllRidePostDto>> Handle(GetAllRidePostQuery request, CancellationToken cancellationToken)
        {
            var result = await _ridePostService.GetAllRidePostAsync(request.NextCursor, request.PageSize ?? 10);
            return ResponseFactory.Success(result,"Get all ride post success",200);
        }
    }
}
