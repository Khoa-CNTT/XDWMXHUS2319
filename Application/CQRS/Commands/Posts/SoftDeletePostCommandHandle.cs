
namespace Application.CQRS.Commands.Posts
{
    public class SoftDeletePostCommandHandle : IRequestHandler<SoftDeletePostCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IPostService _postService;
        private readonly IRedisService _redisService;

        public SoftDeletePostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IPostService postService, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _postService = postService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<bool>> Handle(SoftDeletePostCommand request, CancellationToken cancellationToken)
        {
            // 🔥 Lấy thông tin user hiện tại
            var userId = _userContextService.UserId();
            // 🔥 Lấy thông tin bài viết
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            // 🔥 Kiểm tra xem bài viết có tồn tại không
            if (post == null)
                {
                    return ResponseFactory.Fail<bool>("Không tìm thấy bài viết này", 404);
                }
            // 🔥 Kiểm tra xem user hiện tại có quyền xóa bài viết không
            if (post.UserId != userId)
                {
                    return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bài viết này", 403);
                }
            // 🔥 Kiểm tra xem bài viết có bị xóa chưa

            if (post.IsDeleted)
                {
                    return ResponseFactory.Fail<bool>("Bài viết này đã bị xóa", 404);
                }
            // 🔥 Kiểm tra xem tài khoản người dùng có bị tạm ngưng không
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ResponseFactory.Fail<bool>("Người dùng không tồn tại", 404);
            }
            if (user.Status == "Suspended")
            {
                return ResponseFactory.Fail<bool>("Tài khoản đang bị tạm ngưng", 403);
            }
            // 🔥 Bắt đầu giao dịch
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 🔥 Xóa mềm tất cả bài chia sẻ liên quan (đệ quy)
                await _postService.SoftDeletePostAndRelatedDataAsync(post.Id);
                // 🔥 Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                if (request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }
                return ResponseFactory.Success(true, "Xóa bài viết và các bài chia sẻ thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
