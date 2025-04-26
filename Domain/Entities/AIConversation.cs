namespace Domain.Entities
{
    public class AIConversation
    {
        public Guid Id { get;private set; }
        public Guid UserId { get; private set; }
        public string Title { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public ICollection<AIChatHistory> ChatHistories { get;private set; } = new List<AIChatHistory>();
        public User User { get; private set; } = default!; // Navigation property to User entity
        public AIConversation(Guid userId, string title)
        {
            Id = Guid.NewGuid();
            UserId = userId;
            Title = title;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        public void UpdateTitle(string title)
        {
            Title = title;
            UpdatedAt = DateTime.UtcNow;
        }
        public void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
