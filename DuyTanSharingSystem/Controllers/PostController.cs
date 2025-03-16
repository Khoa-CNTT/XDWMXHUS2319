using Application.CQRS.Commands.Posts;
using Application.CQRS.Queries.Post;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : Controller
    {
        private readonly IMediator _mediator;
        public PostController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("ML")]
        public async Task<IActionResult> GetPostForTrainingML([FromQuery] GetPostForTrainingMLQueries request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostCommand request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }
    }
}
