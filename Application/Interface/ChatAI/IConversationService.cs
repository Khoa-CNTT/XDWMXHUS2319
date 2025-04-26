using Application.DTOs.ChatAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.ChatAI
{
    public interface IConversationService
    {
        Task<AIConversationResponseDto> GetUserConversationsAsync(Guid userId, Guid? lastConversationId, int pageSize);
        Task<AIChatHistoryResponseDto> GetChatHistories(Guid conversationId, Guid? lastMessageId, int pageSize);
    }
}
