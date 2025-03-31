using Application.Interface.SearchAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Search
{
    class SearchAiQueriesHandler : IRequestHandler<SearchAiQueries,ResponseModel<string>>
    {
        private readonly ISearchAIService _searchService;


        public SearchAiQueriesHandler(ISearchAIService searchService)
        {
            _searchService = searchService;
        }

        public async Task<ResponseModel<string>> Handle(SearchAiQueries request, CancellationToken cancellationToken)
        {
            var result = await _searchService.ProcessChatMessageAsync(request.Message, request.TopK);
            return ResponseFactory.Success(result,"success",200);
        }
    }
}
