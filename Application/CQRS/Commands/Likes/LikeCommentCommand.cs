using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Likes
{
    public class LikeCommentCommand : IRequest<ResponseModel<bool>>
    {
        public Guid CommentId { get; set; }
        public LikeCommentCommand(Guid commentId)
        {
            CommentId = commentId;
        }
    }
}
