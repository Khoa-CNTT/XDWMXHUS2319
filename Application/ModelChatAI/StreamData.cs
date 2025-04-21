
namespace Infrastructure.ModelChatAI
{
    public class StreamData
    {
        public string SessionId { get; set; }
        public string Data { get; set; }
        public bool IsFinal { get; set; }
    }
}
