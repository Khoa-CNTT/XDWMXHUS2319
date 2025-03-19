using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRidePostRepository : IBaseRepository<RidePost>
    {
        Task<RidePost?> GetByDriverIdAsync(Guid userId);
    }
}
