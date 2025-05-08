using Application.DTOs.RidePost;

namespace Application.CQRS.Commands.RidePosts
{
    public class UpdateRidePostCommand : IRequest<ResponseModel<ResponseRidePostDto>>
    {
        public Guid Id { get; set; }
        public required string Content { get; set; }
        public required string StartLocation { get; set; }
        public required string EndLocation { get; set; }
        public DateTime? StartTime { get; set; }
    }
}
