using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IReportRepository : IBaseRepository<Report>
    {
         Task<int> GetCorrectReportCountAsync(Guid userId);
        Task<int> GetReportCountAsync(Guid userId);
        

    }
}
