using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
namespace Domain.Interface
{
    public interface IBaseRepository<T> where T : class
    {
        Task<List<T>> GetAllAsync();
        IQueryable<T> GetAll();
        Task<T?> GetByIdAsync(Guid id);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task<bool> DeleteAsync(Guid id);
        Task BulkUpdateAsync(List<T> entities);
        //AddRangeAsync
        Task AddRangeAsync(List<T> entities);
        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    }
}
