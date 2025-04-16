using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.DTOs.Reposts
{
    public class ReportDetailsDto
    {
        public Guid Id { get; set; }
        public Guid ReportedBy { get; set; }
        public Guid PostId { get; set; }
        public string? Reason { get; set; }
        public ReportStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool ProcessedByAI { get; set; }
        public bool ProcessedByAdmin { get; set; }
        public string? ViolationDetails { get; set; }
        public ApprovalStatusEnum PreActionStatus { get; set; }
        public ApprovalStatusEnum PostActionStatus { get; set; }
        public ViolationTypeEnum? ViolationType { get; set; }
        public ActionTakenEnum? ActionTaken { get; set; }
    }
}
