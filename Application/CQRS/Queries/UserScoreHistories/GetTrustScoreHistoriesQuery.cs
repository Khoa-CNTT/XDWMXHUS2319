using Application.DTOs.UserScoreHistories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.UserScoreHistories
{
    public class GetTrustScoreHistoriesQuery : IRequest<ResponseModel<ScoreHistoriesWithCursorDto>>
    {
        public DateTime? Cursor { get; set; }
        public int PageSize { get; set; } = 10;
    }
}
