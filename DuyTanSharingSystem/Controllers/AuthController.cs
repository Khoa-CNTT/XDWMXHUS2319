using Application.CQRS.Commands.EmailToken;
using Application.CQRS.Commands.Users;
using Application.DTOs.User;
using Application.Interface;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
       private readonly IMediator _mediator;
        private readonly IAuthService _authService;
        public AuthController(IMediator mediator,IAuthService authService)
        {
            _mediator = mediator;
            _authService = authService;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
        {
            var response = await _mediator.Send(command);
            if (response.Success)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required." });
            }
            var response = await _mediator.Send(new VerifyEmailCommand(token));
            if (!response.Success)
            {
                return BadRequest(new { message = response.Message });
            }
            return Redirect("http://localhost:3000/AccountVerified");
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto user)
        {
            var response = await _authService.LoginAsync(user);
            if (response.Success)
            {
                return Ok(response);
            }
            return BadRequest(response);
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var response = await _authService.RefreshTokenAsync();
            if(response== null)
            {
                return BadRequest(new { message = "Invalid token" });
            }
            return Ok(response); // ✅ Trả về Access Token mới
        }


    }
}
