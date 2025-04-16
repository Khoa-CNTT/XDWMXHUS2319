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
        private readonly IUnitOfWork _unitOfWork;

        public RedisService(ICacheService cacheService, IConnectionMultiplexer redis, IConnectionMultiplexer connectionMultiplexer, IUnitOfWork unitOfWork)
        {
            _cacheService = cacheService;
            _database = redis.GetDatabase();
            _redis = connectionMultiplexer;
            _unitOfWork = unitOfWork;
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

        public async Task AddFriendAsync(string? userId, string? friendId)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(friendId))
            {
                Console.WriteLine("userId hoặc friendId bị null hoặc rỗng.");
                return;
            }

            if (!Guid.TryParse(userId, out var userGuid) || !Guid.TryParse(friendId, out var friendGuid))
            {
                Console.WriteLine("userId hoặc friendId không hợp lệ.");
                return;
            }

            var key1 = $"user_friends:{userGuid}";
            var key2 = $"user_friends:{friendGuid}";

            var type1 = await _database.ExecuteAsync("TYPE", key1);
            if (type1.ToString() != "set")
            {
                await _database.KeyDeleteAsync(key1);
                Console.WriteLine($"Xóa key sai kiểu: {key1}");
            }

            var type2 = await _database.ExecuteAsync("TYPE", key2);
            if (type2.ToString() != "set")
            {
                await _database.KeyDeleteAsync(key2);
                Console.WriteLine($"Xóa key sai kiểu: {key2}");
            }

            await _database.SetAddAsync(key1, friendGuid.ToString());
            await _database.SetAddAsync(key2, userGuid.ToString());

            Console.WriteLine($"Thêm bạn bè Redis: {userGuid} <-> {friendGuid}");
        }


        public async Task RemoveFriendAsync(string userId, string friendId)
        {
            await _database.SetRemoveAsync($"user_friends:{userId}", friendId);
            await _database.SetRemoveAsync($"user_friends:{friendId}", userId);
        }

        public async Task<List<string>> GetFriendsAsync(string userId)
        {
            var friends = await _database.SetMembersAsync($"user_friends:{userId}");
            var result = friends.Select(f => f.ToString()).ToList();
            Console.WriteLine($"GetFriendsAsync({userId}) trả về: {string.Join(", ", result)}");
            return result;
        }
        public async Task<Dictionary<string, bool>> CheckMultipleUsersOnlineAsync(List<string> userIds)
        {
            var tasks = userIds.Select(async userId =>
            {
                var status = await _database.StringGetAsync($"user_status:{userId}");
                return (userId, isOnline: status == "online");
            });
            var results = await Task.WhenAll(tasks);
            return results.ToDictionary(x => x.userId, x => x.isOnline);
        }

        public async Task SyncFriendsToRedis(string userId)
        {
            var key = $"user_friends:{userId}";
            var listFriends = await _unitOfWork.FriendshipRepository.GetFriendsAsync(Guid.Parse(userId));

            // Xóa key cũ
            var type1 = await _database.ExecuteAsync("TYPE", key);
            if (type1.ToString() != "set")
            {
                await _database.KeyDeleteAsync(key);
                Console.WriteLine($"Xóa key sai kiểu: {key}");
            }
            else
            {
                await _database.KeyDeleteAsync(key);
            }


            foreach (var friend in listFriends)
            {
                await _database.SetAddAsync(key, friend.FriendId.ToString());
                await _database.SetAddAsync($"user_friends:{friend.FriendId}", userId);
                Console.WriteLine($"Đồng bộ bạn bè: {userId} <-> {friend.FriendId}");
            }
        }
    }
}