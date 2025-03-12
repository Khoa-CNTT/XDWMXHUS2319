using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Model
{
    public class VerifiEmailModel
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public DateTime ExpireDate { get; set; }
        public bool IsVerified { get; set; }
       
    }
}
