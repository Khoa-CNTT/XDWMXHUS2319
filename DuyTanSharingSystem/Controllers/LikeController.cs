using Application.CQRS.Commands.Likes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LikeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("like-post")]
        public async Task<IActionResult> LikePost([FromBody] LikePostCommand likePost)
        {
             //userId Lấy từ token trong thực tế
            var response = await _mediator.Send(likePost);
            return Ok(response);
        }
    }
}
