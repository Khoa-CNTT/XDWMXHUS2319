
namespace Infrastructure.Data.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users
                //.Where(u => u.IsVerifiedEmail)
                .ToListAsync();
        }
     


        public async Task<bool> GetExsitsEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email);
        }

        public async Task<string?> GetFullNameByIdAsync(Guid id)
        {
            return await _context.Users.Where(x => x.Id == id).Select(x => x.FullName).FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
           return await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User?> GetUserByIdAsync(Guid userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<List<User>> SearchUsersAsync(string keyword)
        {
            return await _context.Users
            .Where(u => u.FullName.Contains(keyword) || u.Email.Contains(keyword))
            .ToListAsync();
        }
        //Đếm số lượng bài đăng đi chung xe (RidePosts) của tất cả user và sắp xếp theo thứ tự giảm dần
        public async Task<List<User>> GetTopUsersByRidePostsAsync(int top)
        {
            return await _context.Users
                .OrderByDescending(u => u.RidePosts.Count)
                .Take(top)
                .ToListAsync();
        }
        //Đếm số lượng tham gia nhiều chuyến đi (Rides) nhất với vai trò tài xế của tất cả user và sắp xếp theo thứ tự giảm dần
        public async Task<List<User>> GetTopDriversByRidesAsync(int top)
        {
            return await _context.Users
                .OrderByDescending(u => u.DrivenRides.Count)
                .Take(top)
                .ToListAsync();
        }
        //Đếm số lượng tham gia nhiều chuyến đi (Rides) nhất với vai hành khách của tất cả user và sắp xếp theo thứ tự giảm dần
        public async Task<List<User>> GetTopPassengersByRidesAsync(int top)
        {
            return await _context.Users
                .OrderByDescending(u => u.RidesAsPassenger.Count)
                .Take(top)
                .ToListAsync();
        }
        //đếm số lượng bạn bè của các user (bao gồm cả gửi và nhận lời mời). và sắp xếp theo thứ tự giảm dần
        public async Task<List<User>> GetTopUsersByFriendsAsync(int top)
        {
            return await _context.Users
                .OrderByDescending(u => u.SentFriendRequests.Count + u.ReceivedFriendRequests.Count)
                .Take(top)
                .ToListAsync();
        }
        //đếm số lượng chiase bài viết (Shares) của tất cả user và sắp xếp theo thứ tự giảm dần
        public async Task<List<User>> GetTopUsersBySharesAsync(int top)
        {
            return await _context.Users
                .OrderByDescending(u => u.Shares.Count)
                .Take(top)
                .ToListAsync();
        }
        //đếm số lượng bình luận (Comments) của tất cả user và sắp xếp theo thứ tự giảm dần

        public async Task<List<User>> GetUsersByIdsAsync(List<Guid> userIds)
        {
            return await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync();
        }

        public async Task<bool> ExistUsersAsync(Guid userId)
        {
            return await _context.Users.AnyAsync(u => u.Id == userId);
        }

        public async Task<IEnumerable<User>> GetAdminsAsync()
        {
            return await _context.Users
                .Where(u => u.Role ==RoleEnum.Admin)
                .ToListAsync();
        }

        public async Task<User?> GetAdminByIdAsync(Guid adminId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == adminId && u.Role == RoleEnum.Admin);
        }
    }
}
