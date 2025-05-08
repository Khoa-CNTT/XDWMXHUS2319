using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ResetPasswordCommand : IRequest<ResponseModel<bool>>
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
        public ResetPasswordCommand(string token, string newPassword, string confirmPassword)
        {
            Token = token;
            NewPassword = newPassword;
            ConfirmPassword = confirmPassword;
        }
    }
}
