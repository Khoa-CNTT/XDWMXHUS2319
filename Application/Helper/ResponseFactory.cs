using Application__CaféManagementSystem.Application_.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application__CaféManagementSystem.Application_.Helpers
{
    public static class ResponseFactory
    {
   
        public static ResponseModel<T> Success<T>(T data, string message) 
        {
            return new ResponseModel<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }
        public static ResponseModel<T> Fail<T>(string message, List<string>? errors = null) 
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
        public static ResponseModel<T> FailWithData<T>(T data,string message, List<string>? errors = null)
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message = message,
                Data = data,
                Errors = errors ?? new List<string>()
            };
        }
        public static ResponseModel<T> NotFound<T>(string message) 
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message = message
            };
        }
        public static ResponseModel<T> Error<T>(string message,Exception ex) 
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message =$"{message} \n {ex.Message}"
            };
        }
    }
}
