using Application.DTOs.Ride;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetRidesByUserIdQueriesHandler : IRequestHandler<GetRidesByUserIdQueries, ResponseModel<GetAllRideResponseDto>>
    {
        private readonly IRidePostService _ridePostService; // Inject service chứa GetRidesByUserIdAsync

        public GetRidesByUserIdQueriesHandler(IRidePostService ridePostService)
        {
            _ridePostService = ridePostService;
        }

        public async Task<ResponseModel<GetAllRideResponseDto>> Handle(GetRidesByUserIdQueries request, CancellationToken cancellationToken)
        {
            try
            {
                // Đặt giá trị mặc định cho PageSize nếu không được cung cấp
                int pageSize = request.PageSize ?? 10;

                // Gọi hàm GetRidesByUserIdAsync từ service
                var result = await _ridePostService.GetRidesByUserIdAsync(request.UserId, request.NextCursor, pageSize);

                // Trả về response theo format mong muốn
                return new ResponseModel<GetAllRideResponseDto>
                {
                    Message = "Lấy danh sách ride theo user thành công",
                    Success = true,
                    Data = result,
                    Code = 200,
                    Errors = null
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel<GetAllRideResponseDto>
                {
                    Message = "Lỗi server",
                    Success = false,
                    Data = null,
                    Code = 500,
                    Errors = new List<string> { ex.Message }
                };
            }
        }
    }
}
