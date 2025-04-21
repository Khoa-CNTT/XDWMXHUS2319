using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Reposts
{
    public class ReportDto
    {
        public Guid Id { get; set; }
        public string? Reason { get; set; }
        public string? ViolationDetails { get; set; }
        public string? Status { get; set; }
        public string? ViolationType { get; set; }
        public string? ActionTaken { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
