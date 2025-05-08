using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserInformationCommand : IRequest<ResponseModel<UserUpdateInformationDto>>
    {
        public required string Phone { get; set; }
        public required string PhoneRelative { get; set; }
        public required string Gender { get; set; }
    }
}

