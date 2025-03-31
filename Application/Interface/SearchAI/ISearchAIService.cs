using Application.DTOs.Search;
using Application.Model.SearchAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.SearchAI
{
    public interface ISearchAIService
    {
        //Task<List<SearchResultDto>> SearchAsync(string query, int topK = 5);
        Task<string> ProcessChatMessageAsync(string message, int topK = 5);
    }
}
