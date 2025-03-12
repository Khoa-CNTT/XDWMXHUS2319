using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
     public interface IUserRepository : IBaseRepository<User>
    {
        Task<bool> GetExsitsEmailAsync(string email);
        
    }
}
