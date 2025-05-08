using Application.DTOs.Post;
using Application.DTOs.Posts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Posts
{
    public class GetPostsByTypeQuery : IRequest<ResponseModel<GetPostsResponse>>
    {
        public string? PostType { get; set; }
        public Guid? LastPostId { get; set; } // Bài cuối cùng đã load
        public int PageSize { get; set; } // Số bài viết mỗi lần load (mặc định 20)
        public GetPostsByTypeQuery() { }
        public GetPostsByTypeQuery(string postType, Guid? lastPostId, int pageSize = 10)
        {
            PostType = postType;
            LastPostId = lastPostId;
            PageSize = 10;
        }

    }
}
