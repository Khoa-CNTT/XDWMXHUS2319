
using Application.DTOs.User;

namespace Application.DTOs.Message
{
    public class ListInBoxDto
    {
       public List<InBoxDto> InBox { get; set; } = new List<InBoxDto>();
       public Guid NextCursor { get; set; }

    }
    public class InBoxDto
    {
        public UserDto User { get; set; } = new UserDto();
        public Guid ConversationId { get; set; }
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageDate { get; set; }
        public int UnreadCount { get; set; }
        public bool IsSeen { get; set; }
    }
}
