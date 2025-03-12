using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Application__CaféManagementSystem.Application_.Models
{
    public class ResponseModel<T> 
    {
        public string? Message { get; set; }
        public bool Success { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        
       
    }
}
