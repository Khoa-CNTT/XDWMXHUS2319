// Infrastructure Layer

using System.Text.Json;

namespace Infrastructure.Redis
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDatabase _database;

        public RedisCacheService(IConnectionMultiplexer redis)
        {
            _database = redis.GetDatabase();
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            var value = await _database.StringGetAsync(key);
            if (value.IsNullOrEmpty) return default;
            return JsonSerializer.Deserialize<T>(value!);
        }

        public async Task<bool> ListRemoveAsync(string key, string value)
        {
            var redisValue = JsonSerializer.Serialize(value);
            var result = await _database.ListRemoveAsync(key, redisValue);
            return result > 0;
        }

        public Task RemoveAsync(string key)
        {
            return _database.KeyDeleteAsync(key);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan expiration)
        {
            var jsonData = JsonSerializer.Serialize(value);
            return _database.StringSetAsync(key, jsonData, expiration);
        }
    }
}