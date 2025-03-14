using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRefreshtokenRepository : IBaseRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
    }
}
