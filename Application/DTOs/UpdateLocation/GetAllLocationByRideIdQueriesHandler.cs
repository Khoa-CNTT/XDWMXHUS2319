using Application.CQRS.Queries.LocationUpdate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UpdateLocation
{
    public class GetAllLocationByRideIdQueriesHandler
        : IRequestHandler<GetAllLocationByRideIdQueries, ResponseModel<List<UpdateLocationDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        public GetAllLocationByRideIdQueriesHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<ResponseModel<List<UpdateLocationDto>>> Handle(
        GetAllLocationByRideIdQueries request,
        CancellationToken cancellationToken)
        {
            var locations = await _unitOfWork.LocationUpdateRepository.GetAllByRideIdAsync(request.RideId);

            if (locations == null || !locations.Any())
                return ResponseFactory.Fail<List<UpdateLocationDto>>("Không tìm thấy vị trí nào", 404);

            var locationDtos = locations
                .Where(l => l != null)
                .Select(location => new UpdateLocationDto
                {
                    RideId = location!.RideId, // '!' đảm bảo với compiler là không null
                    Latitude = location.Latitude,
                    Longitude = location.Longitude,
                    Timestamp =FormatUtcToLocal(location.Timestamp)
                })
                .OrderByDescending(dto => dto.Timestamp)
                .ToList();


            return ResponseFactory.Success(locationDtos,"Lấy danh sách location thành công", 200);
        }
    }
}
