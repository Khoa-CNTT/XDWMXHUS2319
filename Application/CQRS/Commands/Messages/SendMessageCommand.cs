

namespace Application.CQRS.Commands.Messages
{
    public class SendMessageCommand : IRequest<ResponseModel<MessageDto>>
    {
        public MessageCreateDto MessageDto { get; set; }

        public SendMessageCommand(MessageCreateDto messageDto)
        {
            MessageDto = messageDto;
        }
    }
}
