using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Queries.Messages
{
    public class GetListInBoxMessageQueriesHandler : IRequestHandler<GetListInBoxMessageQueries, ResponseModel<ListInBoxDto>>
    {
        private readonly IMessageService _messageService;
        // Inject các services khác nếu cần (ví dụ: ILogger)

        public GetListInBoxMessageQueriesHandler(IMessageService messageService)
        {
            _messageService = messageService;
        }

        public async Task<ResponseModel<ListInBoxDto>> Handle(GetListInBoxMessageQueries request, CancellationToken cancellationToken)
        {
            try
            {
                // Validate request pageSize (có thể đã làm trong constructor của query)
                if (request.PageSize <= 0 || request.PageSize > Constaint.MaxPageSize)
                {
                    // Có thể log hoặc trả về lỗi cụ thể hơn
                    // Hoặc dựa vào logic trong constructor/service để điều chỉnh
                    request.PageSize = Math.Clamp(request.PageSize, 1, Constaint.MaxPageSize);
                }


                var inboxData = await _messageService.GetListInBoxAsync(request.Cursor, request.PageSize);

                return ResponseFactory.Success(inboxData,"OK", 200); // OK
            }
            catch (UnauthorizedAccessException ex)
            {
                // Log lỗi nếu cần
                return ResponseFactory.Error<ListInBoxDto>("Unauthorized access.", 401,ex); // Unauthorized
            }
            catch (Exception ex) // Bắt các lỗi chung khác
            {
                // Log lỗi chi tiết (ex)
                return ResponseFactory.Error<ListInBoxDto>("An error occurred while processing your request.", 500, ex); // Internal Server Error
            }
        }
    }
}
