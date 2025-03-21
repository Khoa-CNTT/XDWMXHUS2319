﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data.Repositories
{
    public class RidePostRepository : BaseRepository<RidePost>, IRidePostRepository
    {
        public RidePostRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<RidePost>> GetAllRidePostAsync(Guid? lastPostId, int pageSize)
        {
            // Giới hạn số lượng bài viết tối đa cho mỗi request (tránh bị lạm dụng)
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);
            var query = _context.RidePosts.AsQueryable();
            if (lastPostId.HasValue)
            {
                var lastPost =await _context.RidePosts.FindAsync(lastPostId);
                if (lastPost != null)
                {
                    query = query.Where(x => x.CreatedAt < lastPost.CreatedAt);
                }
            }
            var result = await query.OrderByDescending(x => x.CreatedAt).Take(pageSize).ToListAsync();
            return result;
        }

        public async Task<List<RidePost>> GetAllRidePostForOwnerAsync(Guid? lastPostId, int pageSize, Guid ownerId)
        {
            // Giới hạn số lượng bài viết tối đa cho mỗi request (tránh bị lạm dụng)
            const int MAX_PAGE_SIZE = 50;
            pageSize = Math.Min(pageSize, MAX_PAGE_SIZE);

            IOrderedQueryable<RidePost> query = _context.RidePosts
                .Include(rp => rp.User) // Lấy thông tin người đăng bài
                .Include(rp => rp.Ride) // Lấy thông tin chuyến đi
                .Where(rp => rp.UserId == ownerId) // Chỉ lấy bài viết của tài xế
                .OrderByDescending(rp => rp.CreatedAt); // Sắp xếp bài mới nhất lên trước

            // Nếu có LastPostId, chỉ lấy bài cũ hơn nó
            if (lastPostId.HasValue)
            {
                var lastPost = await _context.RidePosts.FindAsync(lastPostId.Value);
                if (lastPost != null)
                {
                    query = query.Where(rp => rp.CreatedAt < lastPost.CreatedAt)
                                 .OrderByDescending(rp => rp.CreatedAt); // Giữ nguyên thứ tự sắp xếp
                }
            }

            return await query
                .Take(pageSize) // Giới hạn số lượng bài viết
                .ToListAsync();
        }



        public async Task<RidePost?> GetByDriverIdAsync(Guid userId)
        {
            return await _dbSet.FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
