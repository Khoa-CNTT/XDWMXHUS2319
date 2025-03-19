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
    }
}
