using Application.DTOs.FriendShips;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Friends
{
    public class GetFriendsListQuery : IRequest<ResponseModel<FriendsListWithCountDto>>
    {
        public DateTime? Cursor { get; set; }
        public int PageSize { get; set; } = 10;
    }
}
