using Application.DTOs.User;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Users
{
    public class UpdateUserProfileCommand : IRequest<ResponseModel<UserProfileDetailDto>>
    {
        public string FullName { get; set; } = string.Empty;
        public IFormFile? ProfileImage { get; set; }
        public IFormFile? BackgroundImage { get; set; }
        public string? Bio { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PhoneRelativeNumber { get; set; }

    }
}
