using Application.CQRS.Commands.Users;
using Application.CQRS.Queries.Post;
using Application.CQRS.Queries.User;
using Application.CQRS.Queries.UserScoreHistories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UserProfileController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile([FromQuery] GetUserProfileQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("user-profile")]
        public async Task<IActionResult> GetFriendUserProfile([FromQuery] GetUserFriendProfileQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("profile-detail")]
        public async Task<IActionResult> GetUserProfileDetail()
        {
            return Ok(await _mediator.Send(new GetUserProfileDetailQuery()));
        }

        [HttpPut("upProfile")]
        public async Task<IActionResult> UpdateUserProfile([FromForm] UpdateUserProfileCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpPut("upInformation")]
        public async Task<IActionResult> UpdateUserInformation([FromBody] UpdateUserInformationCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        [HttpGet("post-images-preview")]
        public async Task<IActionResult> GetPostImagePreview([FromQuery] GetPostImagesPreviewQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpGet("post-images-all")]
        public async Task<IActionResult> GetAllPostImage([FromQuery] GetAllPostImagesByUserQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        /// <summary>
        /// Người dùng báo cáo người dùng khác
        /// </summary>
        [HttpPost("user-report-user")]
        public async Task<IActionResult> ReportUserAsync([FromBody] CreateUserReportUserCommand command)
        {
            var result = await _mediator.Send(command);          
            return Ok(result); // thành công
        }
        [HttpGet("trust-score-histories")]
        public async Task<IActionResult> GetTrustScoreHistories([FromQuery] GetTrustScoreHistoriesQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
