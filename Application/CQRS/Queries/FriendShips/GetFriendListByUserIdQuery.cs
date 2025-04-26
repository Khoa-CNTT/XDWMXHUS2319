using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetFriendListByUserIdQuery : IRequest<ResponseModel<FriendsListWithCursorDto>>
    {
        public Guid UserId { get; set; }
    }
}
