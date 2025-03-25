using Application.DTOs.CommentLikes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.CommentLike
{
    public class GetCommentLikeQuery : IRequest<ResponseModel<GetCommentLikeWithCursorResponse>>
    {
        public Guid CommentId { get; set; }
        public Guid? LastUserId { get; set; } // Cursor
        public GetCommentLikeQuery() { }

        public GetCommentLikeQuery(Guid commentId, Guid? lastUserId)
        {
            CommentId = commentId;
            LastUserId = lastUserId;
        }
    }
}
