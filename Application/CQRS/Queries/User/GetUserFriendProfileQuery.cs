using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserFriendProfileQuery : IRequest<ResponseModel<MaptoUserprofileDetailDto>>
    {
        public Guid UserId { get; set; }
    }
}

