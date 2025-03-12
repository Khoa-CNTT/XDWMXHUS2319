using Application.Model.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class LikeService : ILikeService
    {
        private readonly ICacheService _cacheService;
        public LikeService(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }
        public async Task<bool> AddLikeAsync(Guid userId, Guid postId)
        {
            string likeEventKey = "like_events";

            // Lấy danh sách like hiện tại từ Redis
            var likeEvents = await _cacheService.GetAsync<List<LikeEvent>>(likeEventKey) ?? new List<LikeEvent>();

            // Thêm like mới vào danh sách
            likeEvents.Add(new LikeEvent(postId,userId));

            // Cập nhật lại Redis với danh sách mới
            await _cacheService.SetAsync(likeEventKey, likeEvents, TimeSpan.FromMinutes(10));

            return true;
        }

    }
}
