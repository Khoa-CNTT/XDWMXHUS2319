using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface ILocationUpdateRepository : IBaseRepository<LocationUpdate>
    {
        Task<List<LocationUpdate>> GetListAsync(Expression<Func<LocationUpdate, bool>> filter ,
                                           Func<IQueryable<LocationUpdate>, IOrderedQueryable<LocationUpdate>> orderBy );
        //viết phương thức mới để lấy vị trí gần nhất
        Task<LocationUpdate?> GetLatestLocationByRideIdAsync(Guid rideId);
        //tạo phương thức add range
       // Task AddRangeAsync(List<LocationUpdate> locationUpdates);
        Task<DateTime?> GetTimestampByRideIdAsync(Guid rideId);
        Task<DateTime?> GetPassengerLocationTimestampAsync(Guid passengerId);
        Task<IEnumerable<LocationUpdate>> GetAllByRideIdAsync(Guid rideId);
    }
}
