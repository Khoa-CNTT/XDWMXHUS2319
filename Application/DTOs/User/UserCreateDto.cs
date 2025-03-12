using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserCreateDto
    {
        public required string FullName { get; set; } 
        public required string Email { get; set; } 
        public required string Password { get; set; } 
    }
}
