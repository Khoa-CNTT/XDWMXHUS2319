
namespace Application.DTOs.ChatAI
{
    public class AIChatHistoryDto
    {
        public Guid Id { get; set; }
        public string Query { get;  set; } = string.Empty;
        public string Answer { get;  set; } = string.Empty;
        public DateTime Timestamp { get;  set; }
    }
}
