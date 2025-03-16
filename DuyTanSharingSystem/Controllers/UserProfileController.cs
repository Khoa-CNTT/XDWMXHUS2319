using Application.CQRS.Commands.Users;
using Application.CQRS.Queries.User;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UserProfileController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var result = await _mediator.Send(new GetUserProfileQuery());
            return Ok(result);
        }
        [Authorize]
        [HttpPut("upProfile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileCommand command)
        {
            var uesrid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (uesrid == null)
            {
                return Unauthorized("ban chua dang nhap");
            }
            command.UserId = Guid.Parse(uesrid);
            var result = await _mediator.Send(command);
            if (result.Success)
            {
                return Ok("cap nhat thanh cong");
            }
            return BadRequest("cap nhat that bai");
        }
    }
}
