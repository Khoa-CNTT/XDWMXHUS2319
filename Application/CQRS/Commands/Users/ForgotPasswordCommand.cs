using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ForgotPasswordCommand : IRequest<ResponseModel<bool>>
    {
        public required string Email { get; set; }
    }
}
