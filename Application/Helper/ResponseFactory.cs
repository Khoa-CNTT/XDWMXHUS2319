using Application.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Helpers
{
    public static class ResponseFactory
    {

        public static ResponseModel<T> Success<T>(string message,int? code)
        {
            return new ResponseModel<T>
            {
                Success = true,
                Message = message,
                Code = code
            };
        }
        public static ResponseModel<T> Success<T>(T data, string message,int? code) 
        {
            return new ResponseModel<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Code = code
            };
        }
        public static ResponseModel<T> Fail<T>(string message, int? code, List<string>? errors = null)
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>(),
                Code = code
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
        public static ResponseModel<T> NotFound<T>(string message,int? code) 
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message = message,
                Code = code
            };
        }
        public static ResponseModel<T> Error<T>(string message,int? code, Exception ex) 
        {
            return new ResponseModel<T>
            {
                Success = false,
                Message =$"{message} \n {ex.Message}",
                Code = code
            };
        }
    }
}
