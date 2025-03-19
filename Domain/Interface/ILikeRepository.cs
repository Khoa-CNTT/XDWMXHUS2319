
namespace Domain.Interface
{
    public interface ILikeRepository : IBaseRepository<Like>
    {
        //tạo AddRangeAsync
        Task AddRangeAsync(IEnumerable<Like> entities);
        Task<Like?> GetLikeByPostIdAsync(Guid postId,Guid userid);
    }
}
