using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UpdateLocation
{
    public class UpdateLocationDto
    {
        public Guid? Id { get; set; }
        public Guid RideId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Timestamp { get; set; }
        public string? RideStatus { get; set; }
    }
}
