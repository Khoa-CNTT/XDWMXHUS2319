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
        [HttpGet("GetCommentLikes/{commentId}")]
        public async Task<IActionResult> GetCommentLikes([FromRoute] Guid commentId)
        {
            var response = await _mediator.Send(new GetCommentLikeQuery(commentId));
            return Ok(response);
        }
        [Authorize]
        [HttpPost("like/{id}")]
        public async Task<IActionResult> LikeComment([FromRoute]Guid id)
        {
            var response = await _mediator.Send(new LikeCommentCommand(id));
            return Ok(response);
        }
    }
}
