
namespace Application.DTOs.ChatAI
{
    public class PythonApiResponse
    {
        // Câu trả lời từ LLM (response trong chunk final)
        public string Answer { get; set; } = string.Empty;
        // Truy vấn chuẩn hóa (normalized_query)
        public string NormalizedQuery { get; set; } = string.Empty;
        // Số token (token_count)
        public int TokenCount { get; set; }
        // Results thô từ chunk final
        public List<Dictionary<string, object>> Results { get; set; } = new List<Dictionary<string, object>>();
        public string Type { get; set; } = string.Empty;
    }
}
