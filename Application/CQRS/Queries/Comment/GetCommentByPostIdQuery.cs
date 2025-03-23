using Application.DTOs.Comments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetCommentByPostIdQuery : IRequest<ResponseModel<List<CommentDto>>>
    {
        public Guid PostId { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public GetCommentByPostIdQuery(Guid postId, int page = 1, int pageSize = 2)
        {
            PostId = postId;
            Page = page;
            PageSize = pageSize;
        }
    }
}
