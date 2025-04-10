using Application.DTOs.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
