using Application.DTOs.Search;
using Application.Interface.SearchAI;
using Infrastructure.TogetherAi.Model;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.Cmp;
using System.Net.Http.Json;


namespace Infrastructure.ApiPython
{
    public class ApiPythonService : IApiPythonService
    {
        private readonly HttpClient _httpClient;

        public ApiPythonService(HttpClient httpClient)
        {

            _httpClient = new HttpClient { BaseAddress = new Uri("http://127.0.0.1:8000") };
        }

        public async Task<float[]> GetEmbeddingAsync(string text)
        {
            var response = await _httpClient.PostAsJsonAsync("/embed", new { text });

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Failed to get embedding: {response.StatusCode}");

            var responseContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine("API Response: " + responseContent); // Debug

            var result = await response.Content.ReadFromJsonAsync<EmbeddingData>();
            var vector = result?.Embedding ?? throw new Exception("No embedding returned");

            // Chuẩn hóa vector
            float norm = (float)Math.Sqrt(vector.Sum(v => v * v));
            if (norm == 0)
                throw new Exception("Vector has zero norm, cannot normalize");
            return vector.Select(v => v / norm).ToArray();
        }

        public async Task StoreVectorAsync(string id, float[] vector, string type, string content)
        {
            // Gửi dưới dạng danh sách items
            var request = new
            {
                items = new[]
                {
                new
                {
                    id,
                    embedding = vector,
                    type,
                    content
                }
            }
            };

            var response = await _httpClient.PostAsJsonAsync("/store", request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to store vector: {response.StatusCode}, {errorContent}");
            }

            Console.WriteLine($"Stored vector for id: {id}");
        }

    }
}
