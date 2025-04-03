using Application.CQRS.Commands.RidePosts;
using Application.CQRS.Queries.RIdePost;
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
        //tạo bài post
        [HttpPost("create")]
        public async Task<IActionResult> CreateRidePost([FromBody] CreateRidePostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        //xóa bài post
        [HttpPatch("cancel")]
        public async Task<IActionResult> CancelRidePost([FromBody] CanceledStatusCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        //cập nhật bài post
        [HttpPut("update")]
        public async Task<IActionResult> UpdateRidePost([FromBody] UpdateRidePostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        //lấy tất cả bài post
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllRidePost([FromQuery] GetAllRidePostQuery query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        //lấy tất cả bài post của chính mình
        [HttpGet("get-all-for-owner")]
        public async Task<IActionResult> GetAllRidePostForOwner([FromQuery] GetAllRidePostForOwnerQuery query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        //lấy bài post theo id
        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetRidePostById([FromQuery] GetRidePostByIdQueries query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        [HttpGet("passenger")]
        public async Task<IActionResult> GetRidePostsByPassenger([FromQuery] GetRidePostsByPassengerIdQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("driver")]
        public async Task<IActionResult> GetRidePostsByDriver([FromQuery] GetRidePostsByDriverIdQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
