
namespace Domain.Entities
{
    public class Conversation
    {
        public Guid Id { get;private set; }

        public Guid User1Id { get; private set; }
        public Guid User2Id { get; private set; }

        public DateTime CreatedAt { get; private set; } =  DateTime.UtcNow;

        // Navigation
        // Navigation properties
        public User User1 { get;private set; } = default!;
        public User User2 { get;private set; } = default!;
        public ICollection<Message> Messages { get;private set; } = new List<Message>();
        public Conversation(Guid user1Id, Guid user2Id)
        {
            User1Id = user1Id;
            User2Id = user2Id;
        }
    }

}
