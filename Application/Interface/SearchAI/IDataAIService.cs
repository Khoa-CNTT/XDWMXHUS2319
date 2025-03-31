
using Infrastructure.Qdrant.Model;

namespace Application.Interface.SearchAI
{
    public interface IDataAIService
    {
        Task<List<SearchResult>> SearchVectorAsync(string query, string queryType, int topK = 5);
        Task ImportAllDataAsync();
    }
}
