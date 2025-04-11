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
            return Ok(await _mediator.Send(new GetUserProfileQuery()));
        }
        [Authorize]
        [HttpGet("profile-detail")]
        public async Task<IActionResult> GetUserProfileDetail()
        {
            return Ok(await _mediator.Send(new GetUserProfileDetailQuery()));
        }
        [Authorize]
        [HttpPut("upProfile")]
        public async Task<IActionResult> UpdateUserProfile([FromForm] UpdateUserProfileCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
