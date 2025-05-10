

namespace Application.Interface.ContextSerivce
{
     public interface IUserContextService
    {
        Guid UserId ();
        string FullName();
        string Role();
        string AccessToken();
        bool IsAuthenticated();
    }
}
