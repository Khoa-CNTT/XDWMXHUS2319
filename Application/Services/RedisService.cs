using Application.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class RedisService : IRedisService
    {
        private readonly ICacheService _cacheService;
        public RedisService(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }
        public async Task<bool> AddAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            // Lấy danh sách hiện tại từ Redis (nếu có)
            var existingList = await _cacheService.GetAsync<List<T>>(key) ?? new List<T>();

            // Thêm phần tử mới vào danh sách
            existingList.Add(value);

            // Lưu lại vào Redis
            await _cacheService.SetAsync(key, existingList, expiry ?? TimeSpan.FromMinutes(10));

            return true;
        }

        public async Task<bool> ExistsAsync(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                throw new ArgumentNullException(nameof(key));
            }
            return await _cacheService.GetAsync<List<object>>(key) != null;
        }
        //chat ai
        public async Task SaveDataAsync<T>(string key, T data, TimeSpan? expiry = null)
        {
            await _cacheService.SetAsync(key, data, expiry ?? TimeSpan.FromMinutes(30));
        }

        public async Task<T?> GetDataAsync<T>(string key)
        {
            return await _cacheService.GetAsync<T>(key);
        }

        public async Task RemoveDataAsync(string key)
        {
            await _cacheService.RemoveAsync(key);
        }

        //chat ai
        public Task<TimeSpan?> GetExpiryAsync(string key)
        {
            throw new NotImplementedException();
        }

        public async Task<List<T>?> GetListAsync<T>(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                throw new ArgumentNullException(nameof(key));
            }
            return await _cacheService.GetAsync<List<T>>(key);
        }

        public Task<bool> RemoveAsync(string key)
        {
            throw new NotImplementedException();
        }

        public Task<bool> RemoveItemFromListAsync<T>(string key, T value)
        {
            throw new NotImplementedException();
        }
    }
}
