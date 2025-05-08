using Application.CQRS.Commands.Likes;
using Application.CQRS.Queries.CommentLike;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentLikeController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CommentLikeController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [Authorize]
        [HttpGet("GetCommentLikes")]
        public async Task<IActionResult> GetCommentLikes([FromQuery] GetCommentLikeQuery query)
        {
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        [Authorize]
        [HttpPost("like/{id}")]
        public async Task<IActionResult> LikeComment([FromRoute]Guid id,string? rediskey)
        {
            var response = await _mediator.Send(new LikeCommentCommand(id, rediskey));
            return Ok(response);
        }
    }
}
