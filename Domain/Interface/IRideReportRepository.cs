using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRideReportRepository : IBaseRepository<RideReport>
    {
        Task<int> GetWarningCountAsync(Guid userId);
    }
}
