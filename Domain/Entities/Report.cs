using static Domain.Common.Enums;
namespace Domain.Entities
{
    public class Report
    {
        public Guid Id { get; private set; }


        public virtual Post? Post { get; private set; }

        public virtual User? ReportedByUser { get; private set; }

        // Xóa bỏ các Data Annotations [Column] không cần thiết
        public Guid PostId { get; private set; }
        public Guid ReportedBy { get; private set; }

        public string Reason { get; private set; } = string.Empty;
        public ReportStatusEnum Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public bool ProcessedByAI { get; private set; }
        public bool ProcessedByAdmin { get; private set; }
        public string? ViolationDetails { get; private set; }
        public ApprovalStatusEnum PreActionStatus { get; private set; }
        public ApprovalStatusEnum PostActionStatus { get; private set; }
        public ViolationTypeEnum? ViolationType { get; private set; }
        public ActionTakenEnum? ActionTaken { get; private set; }
        public bool IsDeleted { get; private set; }



        private Report() { }
        public Report(Guid reportedBy, Guid postId, string reason, ApprovalStatusEnum currentPostStatus)
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
            PreActionStatus = currentPostStatus;
            PostActionStatus = currentPostStatus; // Ban đầu giữ nguyên trạng thái
        }

        /// <summary>
        /// Cập nhật trạng thái của báo cáo.
        /// </summary>
        public void UpdateStatus(ReportStatusEnum newStatus)
        {
            Status = newStatus;
        }
        public void ProcessByAI(bool isViolated, string details, ViolationTypeEnum? violationType)
        {
            Status = isViolated ? ReportStatusEnum.AI_Processed : ReportStatusEnum.Pending;
            ProcessedByAI = true;
            ViolationDetails = details;
            ViolationType = violationType;
            UpdatedAt = DateTime.UtcNow;

            if (isViolated)
            {
                ActionTaken = ActionTakenEnum.HidePost;
            }
        }
        public void ProcessByAdmin(bool isViolated, string details, ViolationTypeEnum? violationType, ActionTakenEnum action)
        {
            Status = isViolated ? ReportStatusEnum.Admin_Approved : ReportStatusEnum.Rejected;
            ProcessedByAdmin = true;
            ViolationDetails = details;
            ViolationType = violationType;
            ActionTaken = action;
            UpdatedAt = DateTime.UtcNow;
        }
        public void UpdatePostStatus(ApprovalStatusEnum newPostStatus)
        {
            PostActionStatus = newPostStatus;
            UpdatedAt = DateTime.UtcNow;
        }
        public void SoftDelete()
        {
            IsDeleted = true;
        }
    }
}

