using Application.DTOs.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetPostsByTypeQuery : IRequest<ResponseModel<List<PostDto>>>
    {
        public string PostType { get; set; }

        public GetPostsByTypeQuery(string postType)
        {
            PostType = postType;
        }
    }
}
