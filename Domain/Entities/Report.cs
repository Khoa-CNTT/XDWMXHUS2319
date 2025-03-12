using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Domain.Entities
{
    public class Report
    {
        public Guid Id { get; private set; }
        public Guid ReportedBy { get; private set; }
        public Guid PostId { get; private set; }
        public string Reason { get; private set; }
        public ReportStatusEnum Status { get; private set; } 
        public DateTime CreatedAt { get; private set; }

        public Report(Guid reportedBy, Guid postId, string reason)
        {
            if (reportedBy == Guid.Empty) throw new ArgumentException("ReportedBy cannot be empty.");
            if (postId == Guid.Empty) throw new ArgumentException("PostId cannot be empty.");
            if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Reason cannot be empty.");

            Id = Guid.NewGuid();
            ReportedBy = reportedBy;
            PostId = postId;
            Reason = reason;
            Status = ReportStatusEnum.Pending;
            CreatedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Cập nhật trạng thái của báo cáo.
        /// </summary>
        public void UpdateStatus(ReportStatusEnum newStatus)
        {
            Status = newStatus;
        }
    }

 
}

