using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRidePostRepository : IBaseRepository<RidePost>
    {
        Task<RidePost?> GetByDriverIdAsync(Guid userId);
        Task<List<RidePost>> GetAllRidePostAsync(Guid? lastPostId, int pageSize);
        Task<List<RidePost>> GetAllRidePostForOwnerAsync(Guid? lastPostId, int pageSize,Guid ownerId);
        Task<List<RidePost>> GetAllRidePostForSearchAI();
        Task<int> GetRidePostCountAsync(Guid userId);
        Task<(string start, string end)> GetLatLonByRidePostIdAsync(Guid id);

    }
}
