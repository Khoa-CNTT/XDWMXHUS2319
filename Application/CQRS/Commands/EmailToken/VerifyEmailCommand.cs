using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.EmailToken
{
    public class VerifyEmailCommand : IRequest<ResponseModel<bool>>
    {
        public string Token { get; set; }

        public VerifyEmailCommand(string token)
        {
            Token = token;
        }
    }

}
