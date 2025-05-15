using Application.DTOs.Ride;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Ride
{
    public class GetCompletedRidesWithRatingQuery : IRequest<ResponseModel<List<CompletedRideWithRatingDto>>>
    {
        public Guid UserId { get; set; }
    }
}
