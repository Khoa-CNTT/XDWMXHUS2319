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
    public class GetSharesByPostIdQuery : IRequest<ResponseModel<List<UserDto>>>
    {
        public Guid PostId { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public GetSharesByPostIdQuery(Guid postId, int page, int pageSize)
        {
            PostId = postId;
            Page = page;
            PageSize = pageSize;
        }
    }
}
