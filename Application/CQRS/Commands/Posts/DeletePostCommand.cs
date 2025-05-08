

namespace Application.CQRS.Commands.Posts
{
    public class DeletePostCommand : IRequest<ResponseModel<bool>>
    {
        public Guid PostId { get; set; }
        public string? redis_key { get; set; } = string.Empty;


        public DeletePostCommand(Guid postId,string? redis_key)
        {
            PostId = postId;
            this.redis_key = redis_key;

        }

    }
}
