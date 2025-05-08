using Application.DTOs.Post;

namespace Application.CQRS.Commands.Posts
{
    public class CreatePostCommand : IRequest<ResponseModel<ResponsePostDto>>
    {
        public required string Content { get;  set; }
        public List<IFormFile>? Images { get; set; } // ✅ hỗ trợ nhiều ảnh
        public IFormFile? Video { get;  set; }
        public ScopeEnum Scope { get;  set; }
        public string? redis_key { get; set; } = string.Empty;
    }
}
