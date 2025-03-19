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
    public class HereMapService : IMapService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public HereMapService(HttpClient httpClient, IOptions<MapsKeyModel> apiKey)
        {
            _httpClient = httpClient;
            _apiKey = apiKey.Value.ApiKey;
        }

        public async Task<(double lat, double lng)> GetCoordinatesAsync(string address)
        {
            var value = Uri.EscapeDataString(address);
            var url = $"https://geocode.search.hereapi.com/v1/geocode?q={value}&apiKey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            if (response.Contains("error"))
            {
                throw new Exception($"Invalid address: {address}");
            }
            using var jsonDoc = JsonDocument.Parse(response);

            var results = jsonDoc.RootElement.GetProperty("items");
            if (results.GetArrayLength() == 0)
            {
                throw new Exception($"Invalid address: {address}");
            }

            var location = results[0].GetProperty("position");
            double lat = location.GetProperty("lat").GetDouble();
            double lng = location.GetProperty("lng").GetDouble();
            return (lat, lng);
        }

        public async Task<string?> GetAddressFromCoordinatesAsync(double lat, double lng)
        {
            var url = $"https://revgeocode.search.hereapi.com/v1/revgeocode?at={lat},{lng}&apiKey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            using var jsonDoc = JsonDocument.Parse(response);

            var results = jsonDoc.RootElement.GetProperty("items");
            if (results.GetArrayLength() == 0)
            {
                return null;
            }

            return results[0].GetProperty("address").GetProperty("label").GetString();
        }

        public async Task<(double distanceKm, int durationMinutes)> GetDistanceAndTimeAsync(string origin, string destination)
        {
            var url = $"https://router.hereapi.com/v8/routes?transportMode=car&origin={Uri.EscapeDataString(origin)}&destination={Uri.EscapeDataString(destination)}&return=summary&apiKey={_apiKey}";
            var response = await _httpClient.GetStringAsync(url);
            using var jsonDoc = JsonDocument.Parse(response);

            var route = jsonDoc.RootElement.GetProperty("routes")[0].GetProperty("sections")[0].GetProperty("summary");
            double distanceKm = route.GetProperty("length").GetDouble() / 1000.0;
            int durationMinutes = route.GetProperty("duration").GetInt32() / 60;

            return (distanceKm, durationMinutes);
        }
       

    }
}
