using Application.DTOs.Comments;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Comment
{
    public class GetCommentByPostIdQuery : IRequest<ResponseModel<GetCommentsResponse>>
    {
        public Guid PostId { get; set; }
        public Guid? LastCommentId { get; set; }
        public int PageSize { get; private set; } = 10;
        public GetCommentByPostIdQuery() { }
        public GetCommentByPostIdQuery(Guid postId, Guid? lastCommentId = null, int pageSize = 10)
        {
            PostId = postId;
            LastCommentId = lastCommentId;
            PageSize = 10;
        }
    }
}
