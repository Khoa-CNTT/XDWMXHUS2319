using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.ChatAI
{
    public class UpdateMessageCommandHandler : IRequestHandler<UpdateMessageCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRedisService _redisService;
        private readonly IUserContextService _userContextService;
        public UpdateMessageCommandHandler(IUnitOfWork unitOfWork, IRedisService redisService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _redisService = redisService;
            _userContextService = userContextService;
        }
        public async Task<ResponseModel<bool>> Handle(UpdateMessageCommand request, CancellationToken cancellationToken)
        {
            // Implement the logic to update the message here
            var chatHistory =await _unitOfWork.AIChatHistoryRepository.GetByIdAsync(request.ChatHistoryId);
            if (chatHistory == null)
            {
                return new ResponseModel<bool>
                {
                    Success = false,
                    Message = "Chat history not found"
                };
            }
            chatHistory.UpdateAnswer(request.SuccessMessage ?? "");
            await _unitOfWork.AIChatHistoryRepository.UpdateAsync(chatHistory);
            await _unitOfWork.SaveChangesAsync();
            if (request.RedisKey != "")
            {
                var key = $"{request.RedisKey}";
                await _redisService.RemoveAsync(key);
            }
            return new ResponseModel<bool>
            {
                Success = true,
                Message = "Message updated successfully"
            };
        }
    }
}
