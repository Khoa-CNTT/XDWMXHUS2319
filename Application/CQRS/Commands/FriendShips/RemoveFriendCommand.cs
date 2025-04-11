using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Friends
{
    public class RemoveFriendCommand : IRequest<ResponseModel<string>>
    {
        public Guid FriendId { get; set; }
        public RemoveFriendCommand(Guid friendId)
        {
            FriendId = friendId;
        }
    }
}
