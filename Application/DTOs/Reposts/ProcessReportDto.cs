using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Reposts
{
    public class ProcessReportDto
    {
        public  Guid ReportId { get; set; }
        public bool IsViolated { get; set; }
        public string? Details { get; set; }
        public ViolationTypeEnum? ViolationType { get; set; }
        public ActionTakenEnum? ActionTaken { get; set; }
    }
}
