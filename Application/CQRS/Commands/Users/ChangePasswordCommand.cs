using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class ChangePasswordCommand : IRequest<ResponseModel<bool>>
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmPassword { get; set; }
        public ChangePasswordCommand(string oldPassword, string newPassword, string confirmPassword)
        {
            OldPassword = oldPassword;
            NewPassword = newPassword;
            ConfirmPassword = confirmPassword;
        }
    }
}

