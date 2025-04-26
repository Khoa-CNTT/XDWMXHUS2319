
namespace Application.DTOs.ChatAI
{
    public class PythonApiResponse
    {
        public string Answer { get; set; } = string.Empty;
        public PythonApiMetadata Metadata { get; set; } = new PythonApiMetadata();
    }
    public class PythonApiMetadata
    {
        public string NormalizedQuery { get; set; } = string.Empty;
        public string Intent { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string LastDataTime { get; set; } = string.Empty;
        public int TokenCount { get; set; } 
    }
}
