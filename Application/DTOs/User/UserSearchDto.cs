using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserSearchDto
    {
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Email { get; set; }
    }
}
