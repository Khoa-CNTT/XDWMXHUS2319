
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Reposts
{
    public class RideReportDto
    {
        public Guid Id { get; set; }
        public Guid RideId { get; set; }
        public Guid PassengerId { get; set; }
        public string? Message { get; set; }
        public string? PhonePassenger { get; set; }
       
        public string? RelativePhonePassenger { get; set; }
        public AlertTypeEnums AlertType { get; set; } 
        public bool Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
