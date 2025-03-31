using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interface
{
    public interface IRatingRepository : IBaseRepository<Rating>
    {
        Task<int> GetDriverRatingScoreAsync(Guid userId);
        public Task<int> GetPassengerRatingScoreAsync(Guid userId);


    }
}
