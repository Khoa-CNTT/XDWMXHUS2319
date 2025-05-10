using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class MaptoUserprofileDetailDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public string? BackgroundPicture { get; set; }
        public string? Bio { get; set; }
        public decimal TrustScore { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
