using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Api
{
    public interface IGeminiService2
    {
        Task<string> GenerateNaturalResponseAsync(string query,string result);
        Task<(string Category, string Keywords)> ClassifyQueryAsync(string query);
    }
}
