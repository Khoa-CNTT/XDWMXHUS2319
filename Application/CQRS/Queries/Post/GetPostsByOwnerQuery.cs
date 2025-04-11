using Application.DTOs.Post;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Post
{
    public class GetPostsByOwnerQuery : IRequest<ResponseModel<GetPostsResponse>>
    {
        public Guid? LastPostId { get; set; }
        public int PageSize { get;private set; }
    }
}
