using Application.CQRS.Commands.Comments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CommentController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [Authorize]
        [HttpPost("CommentPost")]
        public async Task<IActionResult> CommentPost([FromBody] CommentPostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [Authorize]
        [HttpPatch("UpdateComment")]
        public async Task<IActionResult> UpdatePost([FromBody] UpdateCommentCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
        [Authorize]
        [HttpPatch("DeleteComment/{id}")]
        public async Task<IActionResult> UpdatePost([FromRoute]Guid id)
        {
            var response = await _mediator.Send(new SoftDeleteCommentCommand(id));
            return Ok(response);
        }
    }
}
