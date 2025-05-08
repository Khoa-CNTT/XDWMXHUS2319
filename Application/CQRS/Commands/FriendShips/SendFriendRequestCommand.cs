using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Friends
{
    public class SendFriendRequestCommand : IRequest<ResponseModel<ResultSendFriendDto>>
    {
        public Guid FriendId { get; set; }
        public string? redis_key { get; set; } = string.Empty;
    }
}
