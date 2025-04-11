using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Friends
{
    public class RejectFriendRequestCommand : IRequest<ResponseModel<bool>>
    {
        public Guid FriendId { get; set; }
    }
}
