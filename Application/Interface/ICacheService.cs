using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ICacheService
    {
        Task SetAsync<T>(string key, T value, TimeSpan expiration);
        Task<T?> GetAsync<T>(string key);
        Task RemoveAsync(string key);
        Task<bool> ListRemoveAsync(string key,string value);
    }
}
