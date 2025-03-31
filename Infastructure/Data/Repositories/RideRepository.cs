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
    }
}
