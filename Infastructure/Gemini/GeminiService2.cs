using Application.Interface.Api;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Gemini
{
    public class GeminiService2 : IGeminiService2
    {
        private readonly HttpClient _httpClient;
        private readonly GeminiModel _geminiModel;

        public GeminiService2(IHttpClientFactory httpClientFactory, IConfiguration configuration,IOptions<GeminiModel> geminiModel)
        {
            _httpClient = httpClientFactory.CreateClient();
            _geminiModel = geminiModel.Value;
        }

        public async Task<string> GenerateNaturalResponseAsync(string query, string result)
        {
            var prompt = $@"
Bạn đang hỗ trợ người dùng tìm kiếm thông tin. Dưới đây là dữ liệu truy vấn:
- Câu hỏi từ người dùng: '{query}'
- Lưu ý: hãy ưu tiên trả lời câu hỏi cuối cùng của người dùng.
- Kết quả tìm được trong Database: {result}

**Hướng dẫn trả lời:**
1. Nếu kết quả liên quan đến câu hỏi, hãy tóm tắt thông tin từ Database một cách tự nhiên, thân thiện và dễ hiểu.
2. Nếu kết quả **không có** hoặc **không liên quan**, chỉ trả lời: 'communicate: Dữ liệu không tồn tại!!'.
3. Nếu người dùng chỉ chào (ví dụ: 'Hello', 'Chào bạn', 'Hi'), hãy trả lời tự nhiên và thân thiện mà không cần dữ liệu từ database. Ví dụ: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊'.
4. Nếu câu hỏi không phù hợp với hệ thống (không liên quan đến dữ liệu của chúng ta), hãy trả lời: 'communicate: Câu hỏi không hợp lệ trong hệ thống'.
5. Cuối câu trả lời, hãy hỏi lại một câu để tiếp tục hỗ trợ người dùng.

Bây giờ, hãy tạo phản hồi cho câu hỏi trên.
";

            return await CallGemini(prompt);
        }

        public async Task<(string Category, string Keywords)> ClassifyQueryAsync(string query)
        {
            var prompt = @$"Website được thiết kế nhằm tạo ra một nền tảng giao tiếp và trao đổi thông tin giữa các sinh viên trong trường đại học. Nền tảng này có thể phục vụ nhiều mục đích như:
        Chia sẻ thông tin di chuyển: Sinh viên có thể đăng thông báo hành trình từ điểm A đến điểm B để tìm bạn đi chung, qua đó tiết kiệm chi phí và tăng cường kết nối.
        Chia sẻ tài liệu học tập: Sinh viên có dư tài liệu sau khi hoàn thành môn học có thể đăng bán hoặc chia sẻ tài liệu cho những ai cần.
        Các dịch vụ khác: Có thể mở rộng sang trao đổi đồ dùng, tổ chức nhóm học tập, thảo luận các chủ đề học thuật hay đời sống sinh viên.
        Nếu câu hỏi không phù hợp với hệ thống, hãy trả lời: 'communicate: Câu hỏi không hợp lệ trong hệ thống'.
        Phân loại câu hỏi sau vào một trong các loại: 
        'ridepost', 'post', 'user', 'general', 'ride', 'rating', 'comment', 'report', 
        'like', 'likecomment', 'share', 'location', 'ridereport'.
        Trả về JSON với format: {{ ""category"": ""loại"", ""keywords"": [""từ khóa""] }}.
        Nếu không xác định được, trả về {{ ""category"": ""unknown"", ""keywords"": [] }}.
        Câu hỏi: ""{query}""";

            var result = await CallGemini(prompt);

            try
            {
                var jsonResult = JsonSerializer.Deserialize<Dictionary<string, object>>(result);
                var category = jsonResult?.GetValueOrDefault("category")?.ToString() ?? "unknown";
                var keywords = jsonResult?.GetValueOrDefault("keywords")?.ToString() ?? "[]";

                return (category, keywords);
            }
            catch
            {
                return ("unknown", "[]");
            }
        }


        private async Task<string> CallGemini(string prompt)
        {
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
