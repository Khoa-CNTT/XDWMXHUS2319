using static Domain.Common.Enums;

namespace Infrastructure.Data.Repositories
{
    public class RatingRepository : BaseRepository<Rating>, IRatingRepository
    {
        public RatingRepository(AppDbContext context) : base(context)
        {
        }

        public override Task<bool> DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<int> GetDriverRatingScoreAsync(Guid userId)
        {
            var ratings = await _context.Ratings
                .Where(r => r.UserId == userId)
                .ToListAsync(); // Lấy dữ liệu trước khi tính toán

            return ratings.Sum(r => CalculateRatingScore(r.Level));
        }
        private int CalculateRatingScore(RatingLevelEnum level)
        {
            return level switch
            {
                RatingLevelEnum.Excellent => 40,
                RatingLevelEnum.Good => 20,
                RatingLevelEnum.Average => -20,
                RatingLevelEnum.Poor => -40,
                _ => -40
            };
        }
        public Task<int> GetPassengerRatingScoreAsync(Guid userId)
        {
            return _context.Ratings
                .Where(r => r.RatedByUserId == userId)
                .CountAsync()
                .ContinueWith(t => t.Result * 5);
        }
       
    }
}
