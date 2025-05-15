using Application.DTOs.UserScoreHistories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.UserScoreHistories
{
    public class GetTrustScoreHistoriesQueryHandler : IRequestHandler<GetTrustScoreHistoriesQuery, ResponseModel<ScoreHistoriesWithCursorDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;

        public GetTrustScoreHistoriesQueryHandler(IUnitOfWork unitOfWork, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<ScoreHistoriesWithCursorDto>> Handle(GetTrustScoreHistoriesQuery request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var fetchCount = request.PageSize + 1;

            var histories = await _unitOfWork.UserScoreHistoriesRepository
                .GetTrustScoreHistoriesCursorAsync(userId, request.Cursor, fetchCount, cancellationToken);

            if (!histories.Any())
                return ResponseFactory.Success<ScoreHistoriesWithCursorDto>("Không có lịch sử điểm uy tín", 200);

            if (request.Cursor.HasValue)
            {
                histories = histories.Where(h => h.CreatedAt < request.Cursor.Value).ToList();
            }

            bool hasMore = histories.Count > request.PageSize;
            if (hasMore)
                histories = histories.Take(request.PageSize).ToList();

            var result = histories.Select(Mapping.MapToScoreHistoriesResponseDto).ToList();

            return ResponseFactory.Success(new ScoreHistoriesWithCursorDto
            {
                Histories = result,
                NextCursor = hasMore ? result.Last().CreatedAt : null
            }, "Lấy danh sách lịch sử điểm uy tín thành công", 200);
        }
    }
}
