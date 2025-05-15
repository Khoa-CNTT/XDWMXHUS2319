using Application.CQRS.Commands.Rides;
using Application.CQRS.Queries.Ride;
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
        [HttpPatch("cancel-ride")]
        public async Task<IActionResult> CancelRide([FromQuery] CancelRideCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [HttpPost("rate-driver")]
        public async Task<IActionResult> RateDriver([FromBody] RateDriverCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [HttpGet("get-ride-rating")]
        public async Task<IActionResult> GetAllRideRating([FromQuery] GetCompletedRidesWithRatingQuery query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
    }
}
