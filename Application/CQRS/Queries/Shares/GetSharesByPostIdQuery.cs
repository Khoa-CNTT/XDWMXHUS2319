using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Shares
{
    public class GetSharesByPostIdQuery : IRequest<ResponseModel<GetSharedUsersResponse>>
    {
        public Guid PostId { get; set; }
        public Guid? LastUserId { get; set; }
        public int PageSize { get; } = 10;
        public GetSharesByPostIdQuery() { }
        public GetSharesByPostIdQuery(Guid postId, Guid? lastUserId = null)
        {
            PostId = postId;
            LastUserId = lastUserId;
        }
    }
}
