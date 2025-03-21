using Application.DTOs.Search;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface ISearchService
    {
        Task<List<SearchResultDto>> SearchUsersAsync(string keyword);
        Task<List<SearchResultDto>> SearchPostsAsync(string keyword);
    }
}
