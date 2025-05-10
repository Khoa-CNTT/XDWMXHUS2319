using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserDto
    {
        public Guid? Id { get; set; }
        public string? FullName { get; set; }
        public string? ProfilePicture { get; set; }  // Ảnh đại diện
        public string? Email { get; set; }
        public string? Bio { get; set; } // Giới thiệu bản thân
        public DateTime CreatedAt { get; set; }
        public string? status { get; set; } // Trạng thái tài khoản (Active, Blocked, Suspended)
    }
}
