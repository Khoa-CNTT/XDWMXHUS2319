
namespace Application.DTOs.ChatAI
{
    public class AIChatHistoryResponseDto
    {
        public List<AIChatHistoryDto> ChatHistories { get; set; } = new();
        public Guid? NextCursor { get; set; } = null;
    }
}
