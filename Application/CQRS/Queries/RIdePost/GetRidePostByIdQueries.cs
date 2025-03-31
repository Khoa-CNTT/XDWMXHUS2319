using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.DTOs.RidePost.GetAllRidePostForOwnerDto;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetRidePostByIdQueries : IRequest<ResponseModel<RidePostDto>>
    {
        public required Guid Id { get; set; }
    }
}
