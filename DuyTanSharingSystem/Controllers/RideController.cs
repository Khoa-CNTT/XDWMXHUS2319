using Application.CQRS.Commands.Rides;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RideController : Controller
    {
        private readonly IMediator _mediator;
        public RideController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //tạo chuyến đi
        [HttpPost("create")]
        public async Task<IActionResult> CreateRide([FromBody] CreateRideCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        //bật chế độ an toàn để yêu cầu khách hàng mở định vị khi đi chung
        [HttpPatch("toggleSafetyTracking")]
        public async Task<IActionResult> ToggleSafetyTracking([FromBody] ToggleSafetyTrackingCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
    }
}
