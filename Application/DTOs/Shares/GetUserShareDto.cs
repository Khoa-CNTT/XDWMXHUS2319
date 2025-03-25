using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Shares
{
    public class GetUserShareDto
    {
        public Guid? Id { get; set; }
        public string? FullName { get; set; }
        public string? ProfilePicture { get; set; }
        public string? Email { get; set; }
    }
}
