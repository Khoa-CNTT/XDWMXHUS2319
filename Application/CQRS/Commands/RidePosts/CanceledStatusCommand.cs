using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.RidePosts
{
    public class CanceledStatusCommand : IRequest<ResponseModel<bool>>
    {
        public Guid RideId { get; set; }
        public RidePostStatusEnum Status { get; set; }
    }
}
