
namespace Application.CQRS.Queries.Post
{
    public class GetAllPostImagesByUserQuery : IRequest<List<PostImageDto>>
    {
        public Guid UserId { get; set; }
    }
}
