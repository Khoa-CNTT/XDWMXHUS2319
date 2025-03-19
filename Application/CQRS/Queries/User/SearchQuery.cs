using Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.User
{
    public class SearchQuery : IRequest<ResponseModel<List<SearchResultDto>>>
    {
        public string Keyword { get; set; }
        public SearchQuery(string keyword)
        {
            Keyword = keyword.Trim().ToLower();
        }
    }
}
