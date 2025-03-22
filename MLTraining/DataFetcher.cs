using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace MLTraining
{
    public class DataFetcher
    {
        private readonly HttpClient _httpClient;

        public DataFetcher()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri("https://localhost:7053/") };
        }

        public async Task<List<ModelInput>> GetTrainingDataFromAPI()
        {
            var response = await _httpClient.GetAsync("api/post/ML?ApprovalStatus=Approved");

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine("❌ Lỗi khi gọi API lấy dữ liệu!");
                return new List<ModelInput>();
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<List<PostDto>>>();
            var posts = apiResponse?.Data ?? new List<PostDto>();

            return posts.Select(p => new ModelInput { Content = p.Content, Label = false }).ToList();
        }



        // DTO đại diện cho dữ liệu bài viết từ API
        public class PostDto
        {
        public required string Content { get; set; }
        }
        public class ApiResponse<T>
        {
            public required string Message { get; set; }
            public required bool Success { get; set; }
            public required T Data { get; set; }
        }

    }
}
