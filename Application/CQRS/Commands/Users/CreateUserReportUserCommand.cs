using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class CreateUserReportUserCommand  : IRequest<ResponseModel<bool>>
    {
        public Guid ReportedUserId { get; set; }
        public string Reason { get; set; }

        public CreateUserReportUserCommand(Guid reportedUserId, string reason)
        {
            ReportedUserId = reportedUserId;
            Reason = reason;
        }
    }
    
}
