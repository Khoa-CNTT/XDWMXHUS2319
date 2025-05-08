

namespace Application.CQRS.Commands.ChatAI
{
    public class StoreChatHistoryCommandHandler : IRequestHandler<StoreChatHistoryCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public StoreChatHistoryCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseModel<bool>> Handle(StoreChatHistoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra hội thoại tồn tại và thuộc về người dùng
                var conversation = await _unitOfWork.AIConversationRepository.GetByIdAsync(request.ConversationId);
                if (conversation == null || conversation.UserId != request.UserId)
                    return ResponseFactory.Fail<bool>("Hội thoại không tồn tại hoặc bạn không có quyền", 403);

                // Cập nhật thời gian hội thoại
                conversation.UpdateTimestamp();

                // Tạo bản ghi lịch sử chat
                var chatHistory = new AIChatHistory(request.ConversationId, request.Query, request.Answer, request.TokenCount,request.Context,"");
                await _unitOfWork.AIChatHistoryRepository.AddAsync(chatHistory);

                // Giới hạn lịch sử chat (tối đa 10 bản ghi hoặc tổng token <= 1000)
                var histories = await _unitOfWork.AIChatHistoryRepository.GetHistoriesByConversationId(request.ConversationId);
                int cumulativeTokens = 0;
                for (int i = 0; i < histories.Count; i++)
                {
                    cumulativeTokens += histories[i].TokenCount;
                    if (i >= 10 || cumulativeTokens > 1000)
                    {
                        var idsToDelete = histories.Skip(i).Select(h => h.Id);
                        await _unitOfWork.AIChatHistoryRepository.DeleteRangeAsync(idsToDelete);
                        break;
                    }
                }

                // Lưu thay đổi vào cơ sở dữ liệu
                await _unitOfWork.SaveChangesAsync();
                return ResponseFactory.Success(true, "Lịch sử chat đã được lưu", 200);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Fail<bool>($"Lỗi khi lưu lịch sử chat: {ex.Message}", 500);
            }
        }
    }
}
