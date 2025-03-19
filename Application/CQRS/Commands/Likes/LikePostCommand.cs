using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Likes
{
    public class LikePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }
        public LikePostCommand(Guid postId)
        {
            PostId = postId;
        }
    }
}
