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
        public string? redis_key { get; set; } = string.Empty;
        public LikePostCommand(Guid postId, string? redis_key)
        {
            PostId = postId;
            this.redis_key = redis_key;
        }
    }
}
