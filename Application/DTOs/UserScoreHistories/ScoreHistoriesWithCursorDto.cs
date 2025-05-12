using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserScoreHistories
{
    public class ScoreHistoriesWithCursorDto
    {
        public List<ScoreHistoriesResponseDto> Histories { get; set; } = new List<ScoreHistoriesResponseDto>();
        public DateTime? NextCursor { get; set; }
    }
}
