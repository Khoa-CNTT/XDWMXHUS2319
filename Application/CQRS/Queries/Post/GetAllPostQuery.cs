using Application.DTOs.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetAllPostQuery : IRequest<ResponseModel<List<PostDto>>>
    {
    }
}
