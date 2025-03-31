using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Search
{
    public class SearchAiQueries : IRequest<ResponseModel<string>>
    {
        public required string Message { get; set; }
        public int TopK { get; set; } = 5;
    }
}
