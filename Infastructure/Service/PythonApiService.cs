using Application.DTOs.ChatAI;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using System.Runtime.CompilerServices;
using Application.Interface.ChatAI;

namespace Infrastructure.Service
{

    public class PythonApiService : IPythonApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _pythonApiUrl;
        private readonly ILogger<PythonApiService> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public PythonApiService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<PythonApiService> logger,
            IUnitOfWork unitOfWork)
        {
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _pythonApiUrl = configuration["PythonApi:Url"] ?? "http://127.0.0.1:8000/api/query";
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _unitOfWork = unitOfWork;
        }

        public async IAsyncEnumerable<(string Type, object Content)> SendQueryAsync(
            string query,
            Guid userId,
            Guid conversationId,
            string role,
            string accessToken,
            string streamId,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(180);

            var payload = new
            {
                query,
                user_id = userId.ToString(),
                conversation_id = conversationId.ToString(),
                role,
                stream_id = streamId
            };

            var contents = new StringContent(
                JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = false }),
                Encoding.UTF8,
                "application/json"
            );

            var request = new HttpRequestMessage(HttpMethod.Post, _pythonApiUrl)
            {
                Content = contents
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Python API call failed: {StatusCode}, {Error}, StreamId: {StreamId}", response.StatusCode, error, streamId);
                throw new HttpRequestException($"Python API call failed: {response.ReasonPhrase}, Error: {error}");
            }

            var conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(conversationId);
            if (conversation != null && conversation.Title.Equals("Curent Chat"))
            {
                var title = string.Join(" ", query.Split(' ').Take(10));
                conversation.UpdateTitle(title);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Updated conversation title: {Title}, StreamId: {StreamId}", title, streamId);
            }

            var pythonResponse = new PythonApiResponse();
            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream, Encoding.UTF8);
            string? chunk;

            while ((chunk = await reader.ReadLineAsync()) != null)
            {
                if (string.IsNullOrWhiteSpace(chunk))
                    continue;

                _logger.LogDebug("Received chunk: {Chunk}, StreamId: {StreamId}", chunk, streamId);

                JsonElement jsonChunk;
                try
                {
                    jsonChunk = JsonSerializer.Deserialize<JsonElement>(chunk);
                }
                catch (JsonException)
                {
                    _logger.LogWarning("Invalid JSON chunk: {Chunk}, StreamId: {StreamId}", chunk, streamId);
                    continue;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Error processing chunk: {Error}, Chunk: {Chunk}, StreamId: {StreamId}", ex.Message, chunk, streamId);
                    continue;
                }

                if (jsonChunk.ValueKind != JsonValueKind.Object || !jsonChunk.TryGetProperty("type", out var type))
                    continue;

                var typeValue = type.GetString();
                if (typeValue == "chunk")
                {
                    if (jsonChunk.TryGetProperty("content", out var contentProp))
                    {
                        var content = contentProp.GetString();
                        if (!string.IsNullOrEmpty(content))
                        {
                            pythonResponse.Answer += content; // Thu thập cho final
                            yield return ("chunk", content);
                        }
                    }
                }
                else if (typeValue == "complete")
                {
                    if (jsonChunk.TryGetProperty("content", out var contentProp))
                    {
                        List<Dictionary<string, object>>? results = null;

                        if (contentProp.ValueKind == JsonValueKind.Array)
                        {
                            results = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(contentProp.GetRawText());
                        }
                        else if (contentProp.ValueKind == JsonValueKind.Object)
                        {
                            var singleResult = JsonSerializer.Deserialize<Dictionary<string, object>>(contentProp.GetRawText());
                            if (singleResult != null)
                            {
                                results = new List<Dictionary<string, object>> { singleResult };
                                _logger.LogInformation("Converted single object to array: {Result}, StreamId: {StreamId}", JsonSerializer.Serialize(singleResult), streamId);
                            }
                            else
                            {
                                _logger.LogWarning("Invalid complete content type: {ValueKind}, StreamId: {StreamId}", contentProp.ValueKind, streamId);
                                results = new List<Dictionary<string, object>>();
                            }
                        }

                        _logger.LogDebug("Parsed complete results: {Results}, StreamId: {StreamId}", JsonSerializer.Serialize(results), streamId);
                        yield return ("complete", results ?? new List<Dictionary<string, object>>());
                    }
                }
                else if (typeValue == "final")
                {
                    if (jsonChunk.TryGetProperty("data", out var data))
                    {
                        if (data.TryGetProperty("normalized_query", out var nqVal))
                            pythonResponse.NormalizedQuery = nqVal.GetString() ?? string.Empty;
                        if (data.TryGetProperty("response", out var responseVal))
                            pythonResponse.Answer = responseVal.GetString()?.Trim() ?? pythonResponse.Answer;
                        if (data.TryGetProperty("token_count", out var tcVal) && tcVal.TryGetInt32(out int tokenCount))
                            pythonResponse.TokenCount = tokenCount;
                        if (data.TryGetProperty("results", out var resultsProp))
                        {
                            var results = JsonSerializer.Deserialize<List<Dictionary<string, object>>>(resultsProp.GetRawText());
                            if (results != null)
                                pythonResponse.Results = results;
                        }
                        if (data.TryGetProperty("type", out var nqType))
                            pythonResponse.Type = nqType.GetString() ?? string.Empty;
                    }
                    yield return ("final", pythonResponse);
                }
                else if (typeValue == "error")
                {
                    var message = jsonChunk.TryGetProperty("content", out var msgProp) ? msgProp.GetString() : "Unknown error";
                    _logger.LogError("Python API error: {Message}, StreamId: {StreamId}", message, streamId);
                    throw new HttpRequestException($"Python API error: {message}");
                }
            }
        }
    }
}