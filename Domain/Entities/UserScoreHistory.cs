using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserScoreHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public decimal ScoreChange { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal TotalScoreAfterChange { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
        public UserScoreHistory(Guid userId, decimal scoreChange, string reason, decimal totalScoreAfterChange)
        {
            UserId = userId;
            ScoreChange = scoreChange;
            Reason = reason;
            TotalScoreAfterChange = totalScoreAfterChange;
        }
    }
}
