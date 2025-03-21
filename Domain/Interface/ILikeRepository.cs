
namespace Domain.Interface
{
    public interface ILikeRepository : IBaseRepository<Like>
    {
        //tạo AddRangeAsync
        Task AddRangeAsync(IEnumerable<Like> entities);
        Task<Like?> GetLikeByPostIdAsync(Guid postId,Guid userid);
        Task<List<Like>> GetLikesByPostIdAsync(Guid postId, int page, int pageSize);
        Task<List<Like>> GetLikesByPostIdDeleteAsync(Guid postId);
    }
}
