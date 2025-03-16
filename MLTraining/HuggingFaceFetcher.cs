using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MLTraining
{
    public class HuggingFaceFetcher
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public HuggingFaceFetcher(string apiKey)
        {
            _apiKey = apiKey;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        // 🟢 Gửi prompt đến Hugging Face để lấy văn bản
        public async Task<string> GetGeneratedTextAsync(string prompt)
        {
            string url = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"; // Hoặc dùng bloom-560m

            var requestBody = new
            {
                inputs = prompt,
                parameters = new { max_length = 200 } // Lấy dữ liệu dài hơn
            };

            var jsonRequest = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        // 🟢 Sinh danh sách dữ liệu huấn luyện từ AI
        public async Task<List<ModelInput>> GetTrainingData(int sampleSize = 50)
        {
            var prompts = new List<string>
        {
            "Đây là tin giả về chính trị",
            "Cảnh báo lừa đảo ngân hàng",
            "Hack tài khoản Facebook bằng cách này!",
            "Sự thật về bí mật kinh doanh",
            "Bạn đã trúng thưởng 10.000$!"
        };

            var generatedData = new List<ModelInput>();

            for (int i = 0; i < sampleSize; i++)
            {
                string prompt = prompts[i % prompts.Count]; // Lặp lại nếu hết prompt
                try
                {
                    string responseText = await GetGeneratedTextAsync(prompt);
                    generatedData.Add(new ModelInput { Content = responseText, Label = true }); // Label = true (spam)
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠ Lỗi khi gọi API Hugging Face: {ex.Message}");
                }
            }

            return generatedData;
        }
    }



}
