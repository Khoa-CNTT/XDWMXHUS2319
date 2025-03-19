using Application.Interface.Api;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Maps
{
    public class GoogleMapsService : IMapService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GoogleMapsService(HttpClient httpClient, IOptions<MapsKeyModel> apiKey)
        {
            _httpClient = httpClient;
            _apiKey = apiKey.Value.ApiKey;
        }

        public async Task<string?> GetAddressFromCoordinatesAsync(double lat, double lng)
        {
            var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            using var jsonDoc = JsonDocument.Parse(response);

            var results = jsonDoc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0)
            {
                return null; // Không có kết quả => trả về null
            }

            return results[0].GetProperty("formatted_address").GetString();
        }


        public async Task<(double lat, double lng)> GetCoordinatesAsync(string address)
        {
            try
            {
                // ✅ Dữ liệu giả lập để test trên localhost
                if (address.Contains("localhost"))
                {
                    return (16.070841, 108.224426);
                }

                // 🌍 Gọi Google Maps API
                var url = $"https://maps.googleapis.com/maps/api/geocode/json?address={Uri.EscapeDataString(address)}&key={_apiKey}";
                var response = await _httpClient.GetStringAsync(url);
                using var jsonDoc = JsonDocument.Parse(response);

                // 🛑 Kiểm tra xem có kết quả hợp lệ không
                var results = jsonDoc.RootElement.GetProperty("results");
                if (results.GetArrayLength() == 0)
                {
                    throw new Exception($"Invalid address: {address}");
                }

                var location = results[0].GetProperty("geometry").GetProperty("location");
                double lat = location.GetProperty("lat").GetDouble();
                double lng = location.GetProperty("lng").GetDouble();

                return (lat, lng);
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Failed to connect to Google Maps API: {ex.Message}");
            }
            catch (KeyNotFoundException)
            {
                throw new Exception($"Invalid response format from Google Maps API.");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching coordinates: {ex.Message}");
            }
        }

        public async Task<(double distanceKm, int durationMinutes)> GetDistanceAndTimeAsync(string origin, string destination)
        {
            //sử dụng dữ liệu giả lập để test trên localhost
            if (origin.Contains("localhost") || destination.Contains("localhost"))
            {
                return (10, 20);
            }
            var url = $"https://maps.googleapis.com/maps/api/directions/json?origin={origin}&destination={destination}&key={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            using var jsonDoc = JsonDocument.Parse(response);

            var route = jsonDoc.RootElement.GetProperty("routes")[0].GetProperty("legs")[0];
            double distanceKm = route.GetProperty("distance").GetProperty("value").GetDouble() / 1000.0;
            int durationMinutes = route.GetProperty("duration").GetProperty("value").GetInt32() / 60;

            return (distanceKm, durationMinutes);
        }
    }
}
