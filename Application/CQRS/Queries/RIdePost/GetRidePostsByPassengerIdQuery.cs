using Application.DTOs.Ride;
using Application.DTOs.RidePost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetRidePostsByPassengerIdQuery : IRequest<ResponseModel<GetAllRideResponseDto>>
    {
        public Guid? NextCursor { get; set; }
        public int? PageSize { get; set; }
    }
}
