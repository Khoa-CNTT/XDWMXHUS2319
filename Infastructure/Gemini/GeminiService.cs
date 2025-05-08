using Application.Interface.Api;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Gemini
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiModel _geminiModel;

        public GeminiService(IHttpClientFactory httpClientFactory, IConfiguration configuration,IOptions<GeminiModel> geminiModel)
        {
            _httpClient = httpClientFactory.CreateClient();
            _geminiModel = geminiModel.Value;
        }

        public async Task<bool> ValidatePostContentAsync(string userContent)
        {
            string prompt;
            if (userContent.Contains("StartLocation"))
            {
                prompt = $"trả 'false' nếu điểm bắt đầu và điểm kết thúc không thuộc phạm vi trong thành phố Đà Nẵng - Việt Nam.Ngược lại trả lời 'true'.\n\n{userContent}";
            }
            else
            {
                prompt = $"Trả lời 'false' nếu nội dung sau đây có tính chất lừa đảo, spam, tục tĩu. Ngược lại, trả lời 'true'.\n\n{userContent}";
            }


            var requestBody = new
            {
                contents = new[]
                {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var requestUrl = $"{_geminiModel.Endpoint}?key={_geminiModel.ApiKey}";
            var response = await _httpClient.PostAsync(requestUrl, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"⚠️ Lỗi gọi Gemini API: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            try
            {
                var jsonDocument = JsonDocument.Parse(jsonResponse);
                var resultText = jsonDocument
                    .RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return resultText?.Trim().Equals("true", StringComparison.OrdinalIgnoreCase) ?? false;
            }
            catch (Exception ex)
            {
                throw new Exception($"⚠️ Lỗi parse JSON từ Gemini API: {ex.Message}\nResponse: {jsonResponse}");
            }
        }
        public async Task<string> GenerateNaturalResponseAsync(string query,string result)
        {
            var prompt = $"Câu hỏi tìm kiếm của người dùng : '{query}' và đây là dữ liệu tìm được trong Database {result} của tôi,bạn hãy lọc dữ liệu và trả lời cho người dùng một cách tự nhiên,thân thiện và ngắn gọn nhất có thể với đầy đủ thông tin mà database cung cấp nhớ thêm câu hỏi cuối để giống như bạn đang hỗ trợ người dùng thêm thong tin (dữ liệu từ Database có thể không chính xác 100% nên bạn có thể lọc theo câu hỏi của người dùng)";

            var requestBody = new
            {
                contents = new[]
                {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var requestUrl = $"{_geminiModel.Endpoint}?key={_geminiModel.ApiKey}";
            var response = await _httpClient.PostAsync(requestUrl, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"⚠️ Lỗi gọi Gemini API: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            try
            {
                var jsonDocument = JsonDocument.Parse(jsonResponse);
                var resultText = jsonDocument
                    .RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return resultText ?? "Xin lỗi!!Không có câu trả lời";
            }
            catch (Exception ex)
            {
                throw new Exception($"⚠️ Lỗi parse JSON từ Gemini API: {ex.Message}\nResponse: {jsonResponse}");
            }
        }
    }
    }
