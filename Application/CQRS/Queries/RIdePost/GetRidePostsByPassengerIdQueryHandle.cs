using Application.DTOs.Ride;
using Application.DTOs.RidePost;
using Application.Interface.ContextSerivce;
using Application.Services;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetRidePostsByPassengerIdQueryHandle : IRequestHandler<GetRidePostsByPassengerIdQuery, ResponseModel<GetAllRideResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IRidePostService _ridePostService;
        public GetRidePostsByPassengerIdQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IRidePostService ridePostService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _ridePostService = ridePostService;

        }
        public async Task<ResponseModel<GetAllRideResponseDto>> Handle(GetRidePostsByPassengerIdQuery request, CancellationToken cancellationToken)
        {
            // Lấy PassengerId từ UserContextService
            var passengerId = _userContextService.UserId();
            var ridePosts = await _ridePostService.GetRidePostsByPassengerIdAsync(passengerId, request.NextCursor, request.PageSize ?? 10);
            return ResponseFactory.Success(ridePosts, "Lấy danh sách bài post theo khách hàng thành công", 200);
        }
    }
}
