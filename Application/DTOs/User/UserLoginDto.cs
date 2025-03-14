using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.User
{
    public class UserLoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
