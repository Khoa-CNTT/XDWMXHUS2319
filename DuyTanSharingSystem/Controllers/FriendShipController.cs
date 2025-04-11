using Application.CQRS.Commands.Friends;
using Application.CQRS.Queries.Friends;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FriendShipController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FriendShipController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("send-friend-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPatch("accept-friend-request")]
        public async Task<IActionResult> AcceptFriendRequest([FromBody] AcceptFriendRequestCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpDelete("cancel-friend-request")]
        public async Task<IActionResult> CanncelFriendRequest([FromBody] CancelFriendRequestCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPatch("remove-friend-request")]
        public async Task<IActionResult> RemoveFriendRequest([FromBody] RemoveFriendCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPatch("reject-friend-request")]
        public async Task<IActionResult> RejectFriendRequest([FromBody] RejectFriendRequestCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("get-friends-list")]
        public async Task<IActionResult> GetFriendsList([FromQuery] GetFriendsListQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("get-friends-received")]
        public async Task<IActionResult> GetFriendsReceived([FromQuery] GetReceivedRequestsQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("get-friends-sent")]
        public async Task<IActionResult> GetFriendsSent([FromQuery] GetSentRequestsQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
