using Microsoft.EntityFrameworkCore;
using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class RideRepository : BaseRepository<Ride>, IRideRepository
    {
        public RideRepository(AppDbContext context) : base(context)
        {
        }
        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Ride>> GetActiveRidesAsync()
        {
            return await _context.Rides
                .Where(r=>r.Status== StatusRideEnum.Accepted)
                .ToListAsync();
        }

        public async Task<Ride?> GetRideByUserIdAsync(Guid userId)
        {
            return await _context.Rides.FirstOrDefaultAsync(r=>r.PassengerId ==  userId);
        }
        public Task<int> GetDriveRideCountAsync(Guid userId)
        {
            return _context.Rides.CountAsync(r => r.DriverId == userId);
        }
        public Task<int> GetPassengerRideCountAsync(Guid userId)
        {
            return _context.Rides.CountAsync(r => r.PassengerId == userId);
        }

        public async Task<List<Ride>> GetRidePostsByPassengerIdAsync(Guid passengerId, Guid? lastPostId, int pageSize)
        {
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

            var query = _context.Rides
                .Where(r => r.PassengerId == passengerId)
                .AsQueryable();

            if (lastPostId.HasValue)
            {
                var lastPost = await _context.RidePosts.FindAsync(lastPostId);
                if (lastPost != null)
                {
                    query = query.Where(x => x.CreatedAt < lastPost.CreatedAt);
                }
            }

            return await query.OrderByDescending(x => x.CreatedAt).Take(pageSize).ToListAsync();
        }

        public async Task<List<Ride>> GetRidePostsByDriverIdAsync(Guid driverId, Guid? lastPostId, int pageSize)
        {
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

            var query = _context.Rides
                .Where(r => r.DriverId == driverId)
                .AsQueryable();

            if (lastPostId.HasValue)
            {
                var lastPost = await _context.RidePosts.FindAsync(lastPostId);
                if (lastPost != null)
                {
                    query = query.Where(x => x.CreatedAt < lastPost.CreatedAt);
                }
            }

            return await query.OrderByDescending(x => x.CreatedAt).Take(pageSize).ToListAsync();
        }

        public async Task<IEnumerable<Ride>> GetActiveRidesByPassengerIdAsync(Guid passengerId)
        {
            return await _context.Rides
                .Where(r => r.PassengerId == passengerId &&
                            r.Status == StatusRideEnum.Accepted &&
                            (!r.EndTime.HasValue || r.EndTime > DateTime.UtcNow))
                .ToListAsync();
        }
        public async Task<List<Ride>> GetActiveRidesByDriverIdAsync(Guid driverId)
        {
            return await _context.Rides
                .Where(r => r.DriverId == driverId && r.Status == StatusRideEnum.Accepted)
                .ToListAsync();
        }

    }
}
