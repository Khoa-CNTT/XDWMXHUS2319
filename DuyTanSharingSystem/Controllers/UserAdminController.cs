using Application.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Domain.Common.Enums;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/Admin")]
    [ApiController]
    [Authorize(Policy = "Admin")]
    //[Authorize(Policy = nameof(RoleEnum.Admin))]
    public class UserAdminController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserAdminController(IUserService userService)
        {
            _userService = userService;
        }
        /// <summary>
        /// Lấy danh sách tất cả người dùng
        /// </summary>
        [HttpGet("GetallUser")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            
                // Gọi service để lấy tất cả người dùng
                var users = await _userService.GetAllUsersAsync();
                // Trả về kết quả dưới dạng OkResponse với danh sách người dùng
                return Ok(users);
           
        }

        /// <summary>
        /// Lấy danh sách người dùng với bộ lọc theo trạng thái và tìm kiếm
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsersAsync([FromQuery] string? status, [FromQuery] string? search)
        {           
                var users = await _userService.GetUsersAsync(status, search);
                return Ok(users);           
        }
        /// <summary>
        /// Lấy chi tiết người dùng
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserDetailsAsync(Guid userId)
        {           
                var userDetails = await _userService.GetUserDetailsAsync(userId);
                return Ok(userDetails);           
        }

        /// <summary>
        /// Block người dùng
        /// </summary>
        [HttpPost("{userId}/block")]
        public async Task<IActionResult> BlockUserAsync(Guid userId, [FromQuery] DateTime blockUntil)
        {         
             var result  =   await _userService.BlockUserAsync(userId, blockUntil);
            
            return Ok(result);
        }

        /// <summary>
        /// Suspend người dùng
        /// </summary>
        [HttpPost("{userId}/suspend")]
        public async Task<IActionResult> SuspendUserAsync(Guid userId, [FromQuery] DateTime suspendUntil)
        {           
                await _userService.SuspendUserAsync(userId, suspendUntil);
                return Ok();          
        }

        /// <summary>
        /// Unblock người dùng
        /// </summary>
        [HttpPost("{userId}/unblock")]
        public async Task<IActionResult> UnblockUserAsync(Guid userId)
        {
            var result = await _userService.UnblockUserAsync(userId);
            return Ok( result);
        }
    }
}
