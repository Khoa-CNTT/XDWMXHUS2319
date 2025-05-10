using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserUpdateInformationDto
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PhoneNumberRelative { get; set; }
        public string? Gender { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
