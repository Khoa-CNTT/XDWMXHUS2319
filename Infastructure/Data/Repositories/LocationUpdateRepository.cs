using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class LocationUpdateRepository : BaseRepository<LocationUpdate>, ILocationUpdateRepository
    {
        public LocationUpdateRepository(AppDbContext context) : base(context)
        {
        }

        //public async Task AddRangeAsync(List<LocationUpdate> locationUpdates)
        //{
        //    await _context.AddRangeAsync(locationUpdates);
        //}

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<LocationUpdate>> GetAllByRideIdAsync(Guid rideId)
        {
            return await _context.LocationUpdates
                .Where(r => r.RideId == rideId)
                .ToListAsync();
        }

        public Task<LocationUpdate?> GetLatestLocationByRideIdAsync(Guid rideId)
        {
            return _context.Set<LocationUpdate>()
                .Where(x => x.RideId == rideId)
                .OrderByDescending(x => x.Timestamp)
                .FirstOrDefaultAsync();
        }

        public async Task<List<LocationUpdate>> GetListAsync(
         Expression<Func<LocationUpdate, bool>> filter,
         Func<IQueryable<LocationUpdate>, IOrderedQueryable<LocationUpdate>> orderBy)
        {
            IQueryable<LocationUpdate> query = _context.Set<LocationUpdate>();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.ToListAsync();
        }

        public async Task<DateTime?> GetPassengerLocationTimestampAsync(Guid passengerId)
        {
            return await _context.LocationUpdates
                .Where(r => r.UserId == passengerId)
                .OrderByDescending(x => x.Timestamp)  // Sắp xếp giảm dần
                .Select(x => x.Timestamp)
                .FirstOrDefaultAsync();
        }

        public async Task<DateTime?> GetTimestampByRideIdAsync(Guid rideId)
        {
            return await _context.LocationUpdates
                .Where(r => r.RideId == rideId)
                .OrderByDescending(x => x.Timestamp)  // Sắp xếp giảm dần
                .Select(x => x.Timestamp)
                .FirstOrDefaultAsync();
        }

    }
}
