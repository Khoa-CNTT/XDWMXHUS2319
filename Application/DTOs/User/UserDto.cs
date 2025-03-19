using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string? FullName { get; set; }
        public string? ProfilePicture { get; set; }  // Ảnh đại diện
    }
}
