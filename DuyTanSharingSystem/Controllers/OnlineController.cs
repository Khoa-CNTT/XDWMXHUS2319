using Application.Helpers;
using Application.Interface;
using Domain.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OnlineController : Controller
    {
        private readonly IRedisService _redisService;
        private readonly IUnitOfWork _unitOfWork;
        public OnlineController(IRedisService redisService,IUnitOfWork unitOfWork)
        {
            _redisService = redisService;
            _unitOfWork = unitOfWork;
        }
        [HttpPost("check-online")]
        public async Task<IActionResult> CheckOnlineUsers([FromBody] List<string> userIds, [FromServices] IMemoryCache cache)
        {

            if (userIds == null || !userIds.Any())
            {
                return BadRequest("Danh sách userIds không hợp lệ.");
            }

            var cacheKey = $"online_status_{string.Join("_", userIds.OrderBy(x => x))}";

            if (cache.TryGetValue(cacheKey, out var cachedStatus) && cachedStatus is Dictionary<string, bool> status)
            {
                Console.WriteLine("Lấy trạng thái từ cache");
                return Ok(ResponseFactory.Success(status, "Lấy trạng thái từ cache.", 200));
            }


            var onlineStatus = await _redisService.CheckMultipleUsersOnlineAsync(userIds);
            cache.Set(cacheKey, onlineStatus, TimeSpan.FromSeconds(30)); // Cache 30 giây
            return Ok(ResponseFactory.Success(onlineStatus, "Lấy trạng thái online thành công.", 200));
        }
    }
}
