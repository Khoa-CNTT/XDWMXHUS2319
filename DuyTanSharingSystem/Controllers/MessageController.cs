using Application.Common;
using Application.CQRS.Commands.Messages;
using Application.CQRS.Queries.Messages;
using Application.DTOs.Message;
using Application.Interface;
using Application.Interface.ContextSerivce;
using Application.Model;
using Domain.Interface;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class MessageController : Controller
    {
        private readonly IMessageService _messageService;
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public MessageController(IMessageService messageService, IMediator mediator,IUnitOfWork unitOfWork,IUserContextService userContextService)
        {
            _messageService = messageService;
            _mediator = mediator;
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var command = new GetConversationsQueries();
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("conversations/single")]
        public async Task<IActionResult> GetOrCreateConversation([FromQuery] Guid user2Id)
        {
            var command = new GetOrCreateConversationCommand(user2Id);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageCreateDto dto)
        {
            var command = new SendMessageCommand(dto);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<IActionResult> GetMessages([FromRoute] Guid conversationId, [FromQuery] Guid? nextCursor, [FromQuery] int pageSize = 20)
        {
            var query = new GetMessagesQueries
            {
                ConversationId = conversationId,
                NextCursor = nextCursor
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPatch("{messageId}/seen")]
        public async Task<IActionResult> MarkMessageAsSeen([FromRoute] Guid messageId, [FromQuery] Guid conversationId)
        {
            var command = new MarkMessageAsSeenCommand(messageId, conversationId);
            var result = await _mediator.Send(command);
            return Ok(result);
        }




        //viết để test
        [HttpGet("friends")]
        public async Task<IActionResult> GetFriends()
        {
            var userId = _userContextService.UserId();
            if (userId == Guid.Empty)
            {
                return BadRequest(new ResponseModel<object>
                {
                    Success = false,
                    Message = "Người dùng không hợp lệ.",
                    Code = 400
                });
            }

            var friends = await GetFriendsAsync(userId);

            return Ok(new ResponseModel<List<FriendDto>>
            {
                Success = true,
                Message = "Lấy danh sách bạn bè thành công.",
                Data = friends,
                Code = 200
            });
        }

        public class FriendDto
        {
            public Guid FriendId { get; set; }         // ID của người bạn (khác với người dùng hiện tại)
            public required string FullNameFriend { get; set; }       // Tên đầy đủ của bạn
            public string? AvatarFriend { get; set; }
            public DateTime CreatedAt { get; set; }    // Ngày bắt đầu kết bạn
            public required string Status { get; set; }         // Trạng thái (Pending, Accepted, Blocked,...)
        }
        [HttpGet("friends/{userId}")]
        public async Task<List<FriendDto>> GetFriendsAsync(Guid userId)
        {
            var friendships = await _unitOfWork.MessageRepository.GetFriendshipsAsync(userId);

            if (friendships == null || !friendships.Any())
                return new List<FriendDto>();

            // Lấy ra danh sách ID người bạn (người còn lại trong mối quan hệ)
            var friendIds = friendships
                .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
                .Distinct()
                .ToList();

            // Lấy thông tin người dùng theo friendIds
            var users = await _unitOfWork.UserRepository.GetUsersByIdsAsync(friendIds);

            // Convert thành dictionary cho dễ truy xuất
            var userDict = users.ToDictionary(u => u.Id, u => u.FullName);
            var userPictureDict = users.ToDictionary(u => u.Id, u => u.ProfilePicture);
            var friendDtos = friendships.Select(f =>
            {
                var friendId = f.UserId == userId ? f.FriendId : f.UserId;

                return new FriendDto
                {
                    FriendId = friendId,
                    FullNameFriend = userDict.GetValueOrDefault(friendId, "Không rõ"),
                    AvatarFriend = Constaint.baseUrl + userPictureDict.GetValueOrDefault(friendId, "Không rõ"),
                    CreatedAt = f.CreatedAt,
                    Status = f.Status.ToString()
                };
            }).ToList();

            return friendDtos;
        }

        //

    }
}
