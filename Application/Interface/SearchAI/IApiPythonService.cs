using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.SearchAI
{
    public interface IApiPythonService
    {
        Task<float[]> GetEmbeddingAsync(string text);
        Task StoreVectorAsync(string id, float[] vector, string type, string content);
    }
}
