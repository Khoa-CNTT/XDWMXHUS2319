using Application.DTOs.RidePost;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetAllRidePostForOwnerQueryHandler : IRequestHandler<GetAllRidePostForOwnerQuery, ResponseModel<GetAllRidePostForOwnerDto>>
    {
        private readonly IRidePostService _ridePostService;
        private readonly IUserContextService _userContextService;
        public GetAllRidePostForOwnerQueryHandler(IRidePostService ridePostService, IUserContextService userContextService)
        {
            _ridePostService = ridePostService;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<GetAllRidePostForOwnerDto>> Handle(GetAllRidePostForOwnerQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var ridePosts = await _ridePostService.GetAllRidePostForOwnerAsync( request.NextCursor, request.PageSize ?? 10, userId);
            return ResponseFactory.Success(ridePosts, "Get all ride post for owner successfully", 200);
        }
    }
}
