using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserInformationCommand : IRequest<ResponseModel<UserUpdateInformationDto>>
    {
        public string? PhoneNumber { get; set; }
        public string? PhoneRelativeNumber { get; set; }
        public string? Gender { get; set; }
    }
}

