using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Token
{
    public class EmailTokenDto
    {
        public required UserCreateDto User { get; set; }
        public required string Token { get; set; }
        public required int Expire { get; set; }
    }
}
