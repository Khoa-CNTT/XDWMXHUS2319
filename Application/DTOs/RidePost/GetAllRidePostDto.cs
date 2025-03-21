using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.RidePost
{
    public class GetAllRidePostDto
    {
        public List<ResponseRidePostDto> ResponseRidePostDto { get; set; } = new(); 
        public Guid? NextCursor { get; set; }
    }
}
