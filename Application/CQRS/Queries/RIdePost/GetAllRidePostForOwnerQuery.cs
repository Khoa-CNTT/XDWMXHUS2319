

using Application.DTOs.RidePost;

namespace Application.CQRS.Queries.RIdePost
{
    public class GetAllRidePostForOwnerQuery : IRequest<ResponseModel<GetAllRidePostForOwnerDto>>
    {
        public Guid? NextCursor { get; set; }
        public int? PageSize { get; set; }
    }
}
