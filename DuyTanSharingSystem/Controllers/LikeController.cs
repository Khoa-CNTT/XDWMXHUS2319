using Application.CQRS.Commands.Likes;
using Application.CQRS.Queries.Likes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LikeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LikeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikePost([FromBody] LikePostCommand likePost)
        {
             //userId Lấy từ token trong thực tế
            var response = await _mediator.Send(likePost);
            return Ok(response);
        }
        [HttpGet("get-likes")]
        public async Task<IActionResult> GetLikes([FromQuery] GetLikeByPostIdQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}   
