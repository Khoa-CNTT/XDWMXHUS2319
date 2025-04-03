using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserProfileDetailDto
    {
        public Guid Id { get; set; }
        public required string Email { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? BackgroundPicture { get; set; }
        public string? Bio { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PhoneNumberRelative { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
