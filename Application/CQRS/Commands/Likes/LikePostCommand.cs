using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Likes
{
    public class LikePostCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public Guid PostId { get; set; }
        public LikePostCommand(Guid userId, Guid postId)
        {
            UserId = userId;
            PostId = postId;
        }
    }
}
