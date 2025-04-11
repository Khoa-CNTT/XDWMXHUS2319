using Application.Helpers;
using Application.Interface;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OnlineController : Controller
    {
        private readonly IRedisService _redisService;
        public OnlineController(IRedisService redisService)
        {
            _redisService = redisService;
        }
        [HttpPost("check-online")]
        public async Task<IActionResult> CheckOnlineUsers([FromBody] List<string> userIds)
        {
            if (userIds == null || !userIds.Any())
            {
                return BadRequest("Danh sách userIds không hợp lệ.");
            }

            // Sử dụng pipeline để kiểm tra nhiều key cùng lúc
            var onlineStatusTasks = userIds.Select(async userId =>
            {
                bool isOnline = await _redisService.IsUserOnlineAsync(userId);
                return (userId, isOnline);
            });

            var results = await Task.WhenAll(onlineStatusTasks);
            var onlineStatus = results.ToDictionary(x => x.userId, x => x.isOnline);

            return Ok(ResponseFactory.Success(onlineStatus, "Lấy trạng thái online thành công.",200));
        }
    }
}
