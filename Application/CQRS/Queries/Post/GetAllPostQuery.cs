using Application.DTOs.Post;
using Application.DTOs.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetAllPostQuery : IRequest<ResponseModel<GetPostsResponse>>
    {
        public Guid? LastPostId { get; set; } // Bài cuối cùng đã load
        public int PageSize { get; private set; } 

    }
}
