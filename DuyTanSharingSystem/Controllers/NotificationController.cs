using Application.CQRS.Commands.Notifications;
using Application.CQRS.Queries.Notifications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly IMediator _mediator;
        public NotificationController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("get-all-notifications")]
        public async Task<IActionResult> GetAllNotificationsAsync([FromQuery] GetAllNotificationsQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("get-notifications-by-type")]
        public async Task<IActionResult> GetNotificationsByTypeAsync([FromBody] GetNotificationsByTypeQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("get-notification-unread")]
        public async Task<IActionResult> GetNotificationUnreadAsync([FromQuery] GetUnreadNotificationsQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("get-notification-read")]
        public async Task<IActionResult> GetNotificationReadAsync([FromQuery] GetReadNotificationsQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPatch("mark-as-read")]
        public async Task<IActionResult> MarkAsReadAsync([FromBody] MarkNotificationAsReadCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadNotificationCount()
        {
            var result = await _mediator.Send(new GetUnreadNotificationCountQuery());
            return Ok(result);
        }
    }
}
