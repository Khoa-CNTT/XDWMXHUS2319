using Application.CQRS.Commands.Posts;
using Application.CQRS.Queries.Post;
using Application.CQRS.Queries.Posts;
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
        [HttpGet("getallpost")]
        public async Task<IActionResult> GetAllPost()
        {
            var response = await _mediator.Send(new GetAllPostQuery());
            return Ok(response);
        }

        [HttpGet("GetPostsByType")]
        public async Task<IActionResult> GetPostsByType([FromQuery] string postType)
        {
            var posts = await _mediator.Send(new GetPostsByTypeQuery(postType));
            return Ok(posts);
        }

        [HttpDelete("{postId}")]
        public async Task<IActionResult> DeletePost(Guid postId)
        {
            var result = await _mediator.Send(new DeletePostCommand(postId));
            if (!result.Success)
                return BadRequest(result.Message);

            return Ok(result.Message);
        }
    }
}
