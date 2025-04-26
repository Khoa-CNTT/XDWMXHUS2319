using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetReceivedRequestWithCursorQuery : IRequest<ResponseModel<FriendsListWithCursorDto>>
    {
        public DateTime? Cursor { get; set; }
        public int PageSize { get; set; } = 5;
    }
}
