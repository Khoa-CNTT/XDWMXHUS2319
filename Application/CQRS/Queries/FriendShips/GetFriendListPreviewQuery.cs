using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.FriendShips
{
    public class GetFriendListPreviewQuery : IRequest<ResponseModel<List<FriendDto>>>
    {
        public Guid UserId { get; set; }
    }
}
