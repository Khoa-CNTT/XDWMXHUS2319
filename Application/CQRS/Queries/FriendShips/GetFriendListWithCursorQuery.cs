namespace Application.CQRS.Queries.FriendShips
{
    public class GetFriendListWithCursorQuery : IRequest<ResponseModel<FriendsListWithCursorDto>>
    {
             public DateTime? Cursor { get; set; }
             public int PageSize { get; set; } = 5;
    }
}
