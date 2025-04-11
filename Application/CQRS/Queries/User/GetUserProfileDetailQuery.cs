using Application.DTOs.User;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class GetUserProfileDetailQuery : IRequest<ResponseModel<UserProfileDetailDto>>
    {

    }
}
