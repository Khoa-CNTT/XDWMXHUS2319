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
        public string? redis_key { get; set; } = string.Empty;
        public LikeCommentCommand(Guid commentId,string? rediskey)
        {
            CommentId = commentId;
            redis_key = rediskey;
        }
    }
}
