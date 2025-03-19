using Application.CQRS.Commands.RidePosts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RidePostController : Controller
    {
        private readonly IMediator _mediator;
        public RidePostController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateRidePost([FromBody] CreateRidePostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [HttpPatch("cancel")]
        public async Task<IActionResult> CancelRidePost([FromBody] CanceledStatusCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
    }
}
