using Application.CQRS.Commands.Posts;
using Application.CQRS.Queries.Post;
using Application.CQRS.Queries.Posts;
using Application.CQRS.Queries.RIdePost;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : Controller
    {
        private readonly IMediator _mediator;
        private readonly ILogger<GetAllPostQuery> _logger;
        public PostController(IMediator mediator, ILogger<GetAllPostQuery> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }


        [HttpGet("ML")]
        public async Task<IActionResult> GetPostForTrainingML([FromQuery] GetPostForTrainingMLQueries request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostCommand request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpGet("getallpost")]
        public async Task<IActionResult> GetAllPost([FromQuery] GetAllPostQuery query)
        {
            var stopWatch = Stopwatch.StartNew();

            var response = await _mediator.Send(query);
            stopWatch.Stop();
            _logger.LogInformation("Thời gian xử lý: {elapsedMs}ms", stopWatch.ElapsedMilliseconds);

            return Ok(response);
        }

        [HttpGet("GetPostsByType")]
        public async Task<IActionResult> GetPostsByType([FromQuery] GetPostsByTypeQuery query)
        {
            var posts = await _mediator.Send(query);
            return Ok(posts);
        }
        [HttpGet("GetPostsByOwner")]
        public async Task<IActionResult> GetPostsByOwner([FromQuery] GetPostsByOwnerQuery query)
        {
            var posts = await _mediator.Send(query);
            return Ok(posts);
        }
        [HttpGet("GetPostsByOwnerFriend")]
        public async Task<IActionResult> GetPostsByOwnerFriend([FromQuery] GetPostByOwnerFriendQuery query)
        {
            var posts = await _mediator.Send(query);
            return Ok(posts);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePost([FromQuery] SoftDeletePostCommand command)
        {
                var response = await _mediator.Send(command);
                return Ok(response);
        }
        [HttpPatch("update-post")]
        public async Task<IActionResult> UpdatePost([FromForm] UpdatePostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        //lấy bài post theo id
        [HttpGet("get-by-id")]
        public async Task<IActionResult> GetRidePostById([FromQuery] GetPostByIdQueries query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
    }
}

