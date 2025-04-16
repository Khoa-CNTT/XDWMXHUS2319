using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Reposts
{
    public class ReportResponseDto
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public ReportStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
