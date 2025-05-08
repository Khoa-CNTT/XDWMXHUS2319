namespace Application.CQRS.Queries.Messages
{
    public class GetListInBoxMessageQueries : IRequest<ResponseModel<ListInBoxDto>>
    {
        // Cursor trỏ đến ID của tin nhắn cuối cùng trong trang trước đó
        public Guid? Cursor { get; set; }
        public int PageSize { get; set; } = Constaint.DefaultPageSize;

        // Validate PageSize trong constructor hoặc handler
        public GetListInBoxMessageQueries()
        {
            if (PageSize <= 0)
            {
                PageSize = Constaint.DefaultPageSize;
            }
            else if (PageSize > Constaint.MaxPageSize)
            {
                PageSize = Constaint.MaxPageSize;
            }
        }
    }
}
