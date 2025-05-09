using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.RidePosts
{
    public class DeleteRidePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }
    }
}
