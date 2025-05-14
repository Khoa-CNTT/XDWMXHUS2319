using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserScoreHistories
{
    public class ScoreHistoriesResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public decimal ScoreChange { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal TotalScoreAfterChange { get; set; }
        public DateTime CreatedAt { get; set; } 
    }
}
