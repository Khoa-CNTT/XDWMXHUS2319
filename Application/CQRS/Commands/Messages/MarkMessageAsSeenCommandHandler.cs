

namespace Application.CQRS.Commands.Messages
{
    public class MarkMessageAsSeenCommandHandler : IRequestHandler<MarkMessageAsSeenCommand, ResponseModel<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IMessageService _messageService;
        private readonly IChatService _chatService;

        public MarkMessageAsSeenCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService, IMessageService messageService, IChatService chatService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _messageService = messageService;
            _chatService = chatService;
        }

        public async Task<ResponseModel<string>> Handle(MarkMessageAsSeenCommand request, CancellationToken cancellationToken)
        {
            await _chatService.MarkMessageAsSeenAsync(request.ConversationId,request.MessageId);
            return await _messageService.MarkMessageAsSeenAsync(request.MessageId);
        }
    }
}
