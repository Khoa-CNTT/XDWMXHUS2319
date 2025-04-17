using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Reposts
{
    public class ReportCreateDto
    {
        public Guid PostId { get; set; }
        public string? Reason { get; set; }
    }
}
