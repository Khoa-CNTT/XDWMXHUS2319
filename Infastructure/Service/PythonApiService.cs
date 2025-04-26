using Application.DTOs.ChatAI;
using Application.Interface.ChatAI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Service
{
    public class PythonApiService : IPythonApiService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _pythonApiUrl;
        private readonly ILogger<PythonApiService> _logger;

        public PythonApiService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<PythonApiService> logger)
        {
            _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _pythonApiUrl = configuration["PythonApi:Url"] ?? "http://127.0.0.1:8000/api/query";
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PythonApiResponse> SendQueryAsync(
            string query,
            Guid userId,
            Guid conversationId,
            string role,
            List<AIChatHistoryDto> chatHistory,
            string accessToken,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning("Query is empty or null");
                throw new ArgumentException("Query cannot be empty", nameof(query));
            }

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Access token is empty");
                throw new InvalidOperationException("Access token is required");
            }

            _logger.LogInformation("Sending query to Python API: {Query}, UserId: {UserId}, ConversationId: {ConversationId}", query, userId, conversationId);

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(60);

            var payload = new
            {
                query,
                user_id = userId.ToString(),
                conversation_id = conversationId.ToString(),
                role,
                chat_history = chatHistory
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = false }),
                Encoding.UTF8,
                "application/json"
            );

            var request = new HttpRequestMessage(HttpMethod.Post, _pythonApiUrl)
            {
                Content = content
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Python API call failed: {StatusCode}, {Error}", response.StatusCode, error);
                throw new HttpRequestException($"Python API call failed: {response.ReasonPhrase}, Error: {error}");
            }

            var metadata = new PythonApiMetadata();
            var answerBuilder = new StringBuilder();

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var reader = new StreamReader(stream, Encoding.UTF8);
            string? chunk;
            while ((chunk = await reader.ReadLineAsync()) != null)
            {
                if (string.IsNullOrWhiteSpace(chunk))
                {
                    continue;
                }

                _logger.LogDebug("Received chunk: {Chunk}", chunk);
                try
                {
                    var jsonChunk = JsonSerializer.Deserialize<JsonElement>(chunk);
                    if (jsonChunk.TryGetProperty("type", out var type) && type.GetString() == "metadata")
                    {
                        var headers = jsonChunk.GetProperty("headers");
                        metadata.NormalizedQuery = headers.TryGetProperty("X-Normalized-Query", out var nq) ? nq.GetString() ?? string.Empty : string.Empty;
                        metadata.Intent = headers.TryGetProperty("X-Intent", out var intent) ? intent.GetString() ?? string.Empty : string.Empty;
                        metadata.TableName = headers.TryGetProperty("X-Table-Name", out var tn) ? tn.GetString() ?? string.Empty : string.Empty;
                        metadata.LastDataTime = headers.TryGetProperty("X-Last-Data-Time", out var ldt) ? ldt.GetString() ?? string.Empty : string.Empty;
                        metadata.TokenCount = headers.TryGetProperty("X-Token-Count", out var tc) && int.TryParse(tc.GetString(), out int count) ? count : 0;
                        _logger.LogDebug("Parsed metadata: {Metadata}", JsonSerializer.Serialize(metadata));
                        continue;
                    }
                    // Append non-metadata chunk with normalized whitespace
                    answerBuilder.Append(jsonChunk.ToString().Trim() + " ");
                }
                catch (JsonException)
                {
                    // Treat non-JSON chunk as response content
                    answerBuilder.Append(chunk.Trim() + " ");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Error processing chunk: {Error}, Chunk: {Chunk}", ex.Message, chunk);
                    continue;
                }
            }

            var answer = answerBuilder.ToString().Trim();
            _logger.LogInformation("Received response from Python API: Answer length: {AnswerLength}, Metadata: {Metadata}", answer.Length, JsonSerializer.Serialize(metadata));

            return new PythonApiResponse
            {
                Answer = answer,
                Metadata = metadata
            };
        }
    }
}