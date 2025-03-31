using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Qdrant.Model
{
    public class SearchResult
    {
        public Guid Id { get; set; }
        public float Score { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

    }
}
