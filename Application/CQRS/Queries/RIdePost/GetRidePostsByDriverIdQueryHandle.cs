using Application.DTOs.Ride;
using Application.DTOs.RidePost;
using Application.Interface.ContextSerivce;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
   public class GetRidePostsByDriverIdQueryHandle : IRequestHandler<GetRidePostsByDriverIdQuery, ResponseModel<GetAllRideResponseDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IRidePostService _ridePostService;
        public GetRidePostsByDriverIdQueryHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IRidePostService ridePostService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _ridePostService = ridePostService;
        }
        public async Task<ResponseModel<GetAllRideResponseDto>> Handle(GetRidePostsByDriverIdQuery request, CancellationToken cancellationToken)
        {
            var driverId = _userContextService.UserId();
            var ridePosts = await _ridePostService.GetRidePostsByDriverIdAsync(driverId, request.NextCursor, request.PageSize ?? 10);
            return ResponseFactory.Success(ridePosts, "Lấy danh sách bài post theo tài xế thành công", 200);
        }
    }
}

