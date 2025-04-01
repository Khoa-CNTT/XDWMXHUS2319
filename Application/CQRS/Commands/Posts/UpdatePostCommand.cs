using Application.DTOs.Post;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Posts
{
    public class UpdatePostCommand : IRequest<ResponseModel<UpdatePostDto>>
    {
        public required Guid PostId { get; set; }
        public required string Content { get; set; }
        public IFormFile? Image { get; set; }  // ✅ Chấp nhận file thay vì đường dẫn
        public IFormFile? Video { get; set; }  // ✅ Chấp nhận file thay vì đường dẫn
        public ScopeEnum? Scope { get; set; } // ➜ Thêm dòng này
        public bool IsDeleteImage { get; set; }  // Thêm thuộc tính này để xác định có xóa ảnh không
        public bool IsDeleteVideo { get; set; }  // Thêm thuộc tính này để xác định có xóa video không

    }
}
