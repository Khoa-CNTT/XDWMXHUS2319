using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.Common.Enums;

namespace Application.Helper
{
    public static class HttpStatusHelper
    {
        //    OK = 200,
        //    Created = 201,
        //    BadRequest = 400,
        //    Unauthorized = 401,
        //    Forbidden = 403,
        //    NotFound = 404,
        //    InternalServerError = 500
        private static readonly Dictionary<HttpStatusCodeEnum, string> StatusDescriptions = new()
    {
        { HttpStatusCodeEnum.OK, "Thành công" },
        { HttpStatusCodeEnum.Created, "Dữ liệu đã được tạo" },
        { HttpStatusCodeEnum.BadRequest, "Request không hợp lệ" },
        { HttpStatusCodeEnum.Unauthorized, "Bạn chưa đăng nhập" },
        { HttpStatusCodeEnum.Forbidden, "Bạn không có quyền truy cập" },
        { HttpStatusCodeEnum.NotFound, "Không tìm thấy tài nguyên" },
        { HttpStatusCodeEnum.InternalServerError, "Lỗi máy chủ" }
    };

        public static string GetDescription(HttpStatusCodeEnum statusCode)
        {
            return StatusDescriptions.TryGetValue(statusCode, out string? description) ? description : "Không xác định";
        }
    }
}
