using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AdminUserManagement
{
    class CreateUserActionDto
    {
        public Guid UserId { get; set; }
        public string? Description { get; set; }
    }
}
