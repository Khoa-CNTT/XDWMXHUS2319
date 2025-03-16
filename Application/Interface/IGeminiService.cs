using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface
{
    public interface IGeminiService
    {
        Task<bool> ValidatePostContentAsync(string text);
    }
}
