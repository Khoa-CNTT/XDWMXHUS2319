using Application.CQRS.Commands.Comments;
using Application.CQRS.Queries.Comment;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CommentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("CommentPost")]
        public async Task<IActionResult> CommentPost([FromBody] CommentPostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpPatch("UpdateComment")]
        public async Task<IActionResult> UpdatePost([FromBody] UpdateCommentCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpPatch("DeleteComment/{id}")]
        public async Task<IActionResult> UpdatePost([FromRoute]Guid id)
        {
            var response = await _mediator.Send(new SoftDeleteCommentCommand(id));
            return Ok(response);
        }

        [HttpPost("ReplyComment")]
        public async Task<IActionResult> ReplyComment([FromBody] ReplyCommentCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [HttpGet("GetCommentByPost/{postId}")]
        public async Task<IActionResult> GetCommentsByPostId([FromRoute] Guid postId, [FromQuery] int page = 1, [FromQuery] int pageSize = 2)
        {
            var query = new GetCommentByPostIdQuery(postId, page, pageSize);
            var response = await _mediator.Send(query);
            return Ok(response);
        }
    }
}
