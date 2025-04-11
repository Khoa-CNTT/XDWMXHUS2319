using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetFriendsListQuery : IRequest<ResponseModel<List<FriendDto>>>
    {
    }
}
