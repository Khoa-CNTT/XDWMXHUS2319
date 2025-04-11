// Application Layer
using StackExchange.Redis;
using Application.Interface;

namespace Application.Services
{
    public class RedisService : IRedisService
    {
        private readonly ICacheService _cacheService;
        private readonly IDatabase _database;
        private readonly IConnectionMultiplexer _redis;

        public RedisService(ICacheService cacheService, IConnectionMultiplexer redis, IConnectionMultiplexer connectionMultiplexer)
        {
            _cacheService = cacheService;
            _database = redis.GetDatabase();
            _redis = connectionMultiplexer;
        }
        public async Task<bool> IsMemberOfSetAsync(string key, string value)
        {
            return await _database.SetContainsAsync(key, value);
        }
        public async Task AddToSetAsync(string key, string value, TimeSpan? expiry = null)
        {
            await _database.SetAddAsync(key, value);
            if (expiry.HasValue)
            {
                await _database.KeyExpireAsync(key, expiry);
            }
        }

        public async Task<List<string>> GetSetAsync(string key)
        {
            var values = await _database.SetMembersAsync(key);
            return values.Select(v => v.ToString()).ToList();
        }

        public async Task RemoveFromSetAsync(string key, string value)
        {
            await _database.SetRemoveAsync(key, value);
        }

        public async Task<bool> IsUserOnlineAsync(string userId)
        {
            var status = await GetDataAsync<string>($"user_status:{userId}");
            return status == "online";
        }

        public async Task<bool> AddAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var existingList = await _cacheService.GetAsync<List<T>>(key) ?? new List<T>();
            existingList.Add(value);
            await _cacheService.SetAsync(key, existingList, expiry ?? TimeSpan.FromMinutes(10));
            return true;
        }

        public async Task<bool> ExistsAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) throw new ArgumentNullException(nameof(key));
            var result = await _cacheService.GetAsync<object>(key);
            return result != null;
        }
        public async Task<long> GetListLengthAsync(string key)
        {
            return await _database.ListLengthAsync(key);
        }
        public async Task<long> IncrementAsync(string key, TimeSpan? expiry = null)
        {
            var count = await _database.StringIncrementAsync(key);
            if (expiry.HasValue && count == 1)
            {
                await _database.KeyExpireAsync(key, expiry.Value);
            }
            return count;
        }
        public async Task SaveDataAsync<T>(string key, T data, TimeSpan? expiry = null)
        {
            await _cacheService.SetAsync(key, data, expiry ?? TimeSpan.FromMinutes(30));
        }

        public Task<T?> GetDataAsync<T>(string key)
        {
            return _cacheService.GetAsync<T>(key);
        }

        public Task RemoveDataAsync(string key)
        {
            return _cacheService.RemoveAsync(key);
        }

        public Task<TimeSpan?> GetExpiryAsync(string key)
        {
            return _database.KeyTimeToLiveAsync(key);
        }

        public Task<List<T>?> GetListAsync<T>(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) throw new ArgumentNullException(nameof(key));
            return _cacheService.GetAsync<List<T>>(key);
        }

        public async Task<bool> RemoveItemFromListAsync<T>(string key, T value)
        {
            if (string.IsNullOrWhiteSpace(key)) throw new ArgumentNullException(nameof(key));

            var existingList = await _cacheService.GetAsync<List<T>>(key) ?? new List<T>();
            existingList.Remove(value);
            await _cacheService.SetAsync(key, existingList, TimeSpan.FromMinutes(10));
            return true;
        }

        public Task<bool> RemoveAsync(string key)
        {
            return _database.KeyDeleteAsync(key);
        }
        public async Task<List<string>> GetKeysAsync(string pattern)
        {
            var endpoints = _redis.GetEndPoints();
            var server = _redis.GetServer(endpoints.First());

            // Duyệt và lấy toàn bộ key khớp với pattern
            var keys = server.Keys(pattern: pattern).Select(k => k.ToString()).ToList();
            return await Task.FromResult(keys);
        }

    }
}