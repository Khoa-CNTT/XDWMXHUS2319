using Application.CQRS.Commands.UpdateLocation;
using Application.CQRS.Queries.LocationUpdate;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class UpdateLocationController : Controller
    {
        private readonly IMediator _mediator;
        public UpdateLocationController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //cập nhật vị trí mỗi 2p
        [HttpPost("update")]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [HttpGet("get-all-by-ride-id")]
        public async Task<IActionResult> GetAllLocationByRideId([FromQuery] GetAllLocationByRideIdQueries command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
    }
}
