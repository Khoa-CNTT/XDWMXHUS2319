using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Likes
{
    public class GetLikeByPostIdQuery : IRequest<ResponseModel<List<UserDto>>>
    {
        public Guid PostId { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public GetLikeByPostIdQuery(Guid postId, int page = 1, int pageSize = 2)
        {
            PostId = postId;
            Page = page;
            PageSize = pageSize;
        }
    }
}
