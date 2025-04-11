
namespace Application.CQRS.Commands.Messages
{
    public class GetOrCreateConversationCommand : IRequest<ResponseModel<GetOrCreateConversationResponseDto>>
    {
        public Guid User2Id { get; set; }

        public GetOrCreateConversationCommand(Guid user2Id)
        {
            User2Id = user2Id;
        }
    }
}
