using Application.Interface.ChatAI;
using System.Text;
using System.Text.Json;


namespace Infrastructure.Service
{
    public class PythonApiService : IPythonApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _pythonApiUrl;

        public PythonApiService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _pythonApiUrl = configuration["PythonApi:Url"] ?? "http://localhost:5000/api/query";
        }

        public async Task SendQueryAsync(string query, Guid userId, Guid conversationId, CancellationToken cancellationToken)
        {
            var client = _httpClientFactory.CreateClient();
            var payload = new
            {
                query,
                user_id = userId.ToString(),
                conversation_id = conversationId.ToString()
            };
            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync(_pythonApiUrl, content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to call Python API: {response.ReasonPhrase}");
            }
        }
    }
}
