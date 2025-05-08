
namespace Application.CQRS.Commands.Posts
{
    public class SoftDeletePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }
        public string? redis_key { get; set; } = string.Empty;
        public SoftDeletePostCommand() { }
    }
}
