using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Api
{
    public interface IGeminiService
    {
        Task<bool> ValidatePostContentAsync(string text);
        Task<string> GenerateNaturalResponseAsync(string query,string result);
        Task<ValidationResult> ValidatePostContentWithDetailsAsync(string content);
    }
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
