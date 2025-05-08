namespace Domain.Entities
{
    public class UserReport
    {
        public Guid Id { get; private set; }
        public Guid ReportedUserId { get; private set; }
        public Guid ReportedByUserId { get; private set; }
        public string Reason { get; private set; }
        public DateTime ReportDate { get; private set; } = DateTime.UtcNow;
        public string Status { get; private set; } = "Pending";
        public bool IsDeleted { get; private set; }

        public User? ReportedUser { get; set; }
        public User? ReportedByUser { get; set; }


        public UserReport(Guid reportedUserId, Guid reportedByUserId, string reason)
        {
            Id = Guid.NewGuid();
            ReportedUserId = reportedUserId;
            ReportedByUserId = reportedByUserId;
            Reason = reason;
        }

        public void UpdateStatus(string newStatus)
        {
            Status = newStatus;
        }
        public void SoftDelete()
        {
            IsDeleted = true;
        }
    }
}
