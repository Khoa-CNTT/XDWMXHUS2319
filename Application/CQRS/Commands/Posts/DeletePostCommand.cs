using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class DeletePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }

        public DeletePostCommand(Guid postId)
        {
            PostId = postId;

        }
    }
}
