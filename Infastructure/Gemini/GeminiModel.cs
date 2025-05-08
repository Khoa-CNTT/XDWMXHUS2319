using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Gemini
{
    public class GeminiModel
    {
        public  string ApiKey { get; set; }= string.Empty;
        public string Endpoint { get; set; } = string.Empty;
    }
    public class GeminiModel2
    {
        public string ApiKey2 { get; set; } = string.Empty;
        public string Endpoint2 { get; set; } = string.Empty;
    }
}
