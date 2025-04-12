using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRideRepository : IBaseRepository<Ride>
    {
        Task<IEnumerable<Ride>> GetActiveRidesAsync();
        Task<Ride?> GetRideByUserIdAsync(Guid userId);
        Task<IEnumerable<Ride>> GetActiveRidesByPassengerIdAsync(Guid passengerId);
        Task<int> GetDriveRideCountAsync(Guid userId);
        Task<int> GetPassengerRideCountAsync(Guid userId);
        Task<List<Ride>> GetRidePostsByPassengerIdAsync(Guid passengerId, Guid? lastPostId, int pageSize);
        Task<List<Ride>> GetRidePostsByDriverIdAsync(Guid driverId, Guid? lastPostId, int pageSize);
        Task<List<Ride>> GetActiveRidesByDriverIdAsync(Guid driverId);
        
    }
}
