using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IRedisService
    {
        /// <summary>
        /// Phương thức này nhận vào một key và một đối tượng Event, 
        /// sau đó lấy danh sách Event hiện tại từ Redis (nếu có) và 
        /// thêm Event mới vào danh sách đó. Cuối cùng, lưu lại danh sách mới vào Redis.
        /// ví dụ: await _redisService.AddAsync("like_events", new LikeEvent(request.UserId,request.PostId),null)
        /// </summary>
        /// <typeparam name="T">là 1 một đối tượng Event</typeparam>
        /// <param name="key">key tự do</param>
        /// <param name="value">Nhận vào 1 đối tượng đã đưuọc khởi tạo</param>
        /// <param name="expiry"></param>
        /// <returns></returns>
        Task<bool> AddAsync<T>(string key, T value, TimeSpan? expiry = null);
        /// <summary>
        /// Xóa một key trong Redis.
        /// </summary>
        /// <param name="key">Key cần xóa</param>
        Task<bool> RemoveAsync(string key);

        /// <summary>
        /// Kiểm tra xem một key có tồn tại trong Redis không.
        /// </summary>
        /// <param name="key">Key cần kiểm tra</param>
        Task<bool> ExistsAsync(string key);

        /// <summary>
        /// Lấy toàn bộ danh sách dữ liệu theo key.
        /// Trả về một danh sách các phần tử có kiểu T.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu của danh sách</typeparam>
        /// <param name="key">Key trong Redis</param>
        Task<List<T>?> GetListAsync<T>(string key);

        /// <summary>
        /// Xóa một phần tử cụ thể khỏi danh sách trong Redis theo key.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu của đối tượng</typeparam>
        /// <param name="key">Key trong Redis</param>
        /// <param name="value">Giá trị cần xóa</param>
        Task<bool> RemoveItemFromListAsync<T>(string key, T value);

        /// <summary>
        /// Lấy thời gian hết hạn của key trong Redis (nếu có).
        /// </summary>
        /// <param name="key">Key trong Redis</param>
        Task<TimeSpan?> GetExpiryAsync(string key);
        //chat ai
        Task SaveDataAsync<T>(string key, T data, TimeSpan? expiry = null);
        Task<T?> GetDataAsync<T>(string key);
        Task RemoveDataAsync(string key);
        Task<bool> IsUserOnlineAsync(string userId);
        Task AddToSetAsync(string key, string value, TimeSpan? expiry = null);
        Task<List<string>> GetSetAsync(string key);
        Task RemoveFromSetAsync(string key, string value);
        Task<long> GetListLengthAsync(string key);
        Task<long> IncrementAsync(string key, TimeSpan? expiry = null);
        Task<bool> IsMemberOfSetAsync(string key, string value);
        Task<List<string>> GetKeysAsync(string pattern);
        //friends
        Task AddFriendAsync(string userId, string friendId);
        Task RemoveFriendAsync(string userId, string friendId);
        Task<List<string>> GetFriendsAsync(string userId);
        Task<Dictionary<string, bool>> CheckMultipleUsersOnlineAsync(List<string> userIds);
        Task SyncFriendsToRedis(string userId);
    }
}
