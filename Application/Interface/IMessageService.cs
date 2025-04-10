using Application.DTOs.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IMessageService
    {
        Task<List<ConversationDto>> GetConversationsAsync();
        Task<MessageListDto> GetMessagesAsync(
                Guid conversationId,
                Guid userId,
                Guid? lastMessageId = null,
                int pageSize = 20);
        Task<ResponseModel<string>> MarkMessageAsSeenAsync(Guid messageId);
    }
}
