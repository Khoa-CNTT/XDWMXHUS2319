using Application.CQRS.Commands.ChatAI;
using Application.CQRS.Queries.ChatAI;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatAIController : Controller
    {
        private readonly IMediator _mediator;
        public ChatAIController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //dùng để gửi câu hỏi và nếu người dùng đang ở trong đoạn chat mới(tức chưa có chat history nào) thì sẽ tạo mới cuộc hội thoại
        //tham số là 1 string Query gửi qua body
        [HttpPost("send-query")]
        public async Task<IActionResult> SendQuery([FromBody] SendQueryCommand command)
        {
            var response = await _mediator.Send(command);
            if (response == null)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        //dùng để tạo cuộc hội thoại mới khi người dùng nhấn vào nút new chat
        //không cần tham số
        [HttpPost("create-new-conversation")]
        public async Task<IActionResult> CreateNewConversation([FromBody] CreateNewConversationAICommand command)
        {
            var response = await _mediator.Send(command);
            if (response == null)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
        //dùng để lấy danh sách các cuộc hội thoại đã lưu
        //tham số là 1 Guid lastConversationId dùng để phân trang(có hoặc ko)
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations([FromQuery] Guid? lastConversationId)
        {
            var query = new GetConversationQuery(lastConversationId);
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        //dùng để lấy lịch sử chat của một cuộc hội thoại cụ thể
        //tham số là 1 Guid conversationId dùng để xác định cuộc hội thoại
        [HttpGet("conversation/{conversationId}")]
        public async Task<IActionResult> GetChatHistory([FromQuery] Guid? lastConversationId,Guid conversationId)
       {
            var query = new GetChatHistoryQureies(lastConversationId,conversationId);
            var response = await _mediator.Send(query);
            return Ok(response);
        }
        [HttpPost("save-history")]
        public async Task<IActionResult> SaveChatHistory([FromBody] StoreChatHistoryCommand command)
        {
            var response = await _mediator.Send(command);
            if (response == null)
            {
                return BadRequest("Failed to save chat history");
            }
            return Ok(response);
        }
    }
}
