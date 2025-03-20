using Application.CQRS.Commands.Shares;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShareController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ShareController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [Authorize]
        [HttpPost("SharePost")]
        public async Task<IActionResult> SharePost([FromBody] SharePostCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
    }
}
