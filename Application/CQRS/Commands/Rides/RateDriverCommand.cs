using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Rides
{
    public class RateDriverCommand : IRequest<ResponseModel<RateDriverResponse>>
    {
        public Guid RideId { get; set; }
        public decimal Rating { get; set; } // E.g., 1 to 5 stars
        public string? Comment { get; set; } // Optional comment for the rating
    }

    public class RateDriverResponse
    {
        public Guid RatingId { get; set; }
        public decimal NewReliabilityScore { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}

