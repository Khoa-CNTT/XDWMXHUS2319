using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.AdminUserManagement
{
    public class UserActionDto
    {
        public Guid Id { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
