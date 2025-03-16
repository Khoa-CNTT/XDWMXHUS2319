using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common.Validation
{
    public static class PostValidator
    {
        public static bool IsValid(string content, Func<string, bool> predict)
        {
            if (string.IsNullOrWhiteSpace(content))
                return false;

            // Gọi ML.NET để kiểm duyệt nội dung
            return !predict(content);
        }
    }
}
