using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class SoftDeleteCommentCommand : IRequest<ResponseModel<bool>>
    {
        public Guid CommentId { get; set; }
        public string? redis_key { get; set; } = string.Empty;
        public SoftDeleteCommentCommand(Guid commentId,string? redis_key)
        {
            CommentId = commentId;
            this.redis_key = redis_key;
        }
    }
}
