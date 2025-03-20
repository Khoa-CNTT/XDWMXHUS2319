using Application.DTOs.CommentLikes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.CommentLike
{
    public class GetCommentLikeQuery : IRequest<ResponseModel<List<CommentLikeDto>>>
    {
        public Guid CommentId { get; set; }

        public GetCommentLikeQuery(Guid commentId)
        {
            CommentId = commentId;
        }
    }
}
