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
        public SoftDeleteCommentCommand(Guid commentId)
        {
            CommentId = commentId;
        }
    }
}
