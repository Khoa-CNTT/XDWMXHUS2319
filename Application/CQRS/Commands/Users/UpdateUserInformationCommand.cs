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
        [Required]
        public string Phone { get; set; } = default!;
        [Required]
        public string PhoneRelative { get; set; } = default!;
        [Required]
        public string Gender { get; set; } = default!;
    }
}

