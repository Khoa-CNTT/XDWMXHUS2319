using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Notifications
{
    public class GetUnreadNotificationCountQuery : IRequest<ResponseModel<int>>
    {
    }
}
