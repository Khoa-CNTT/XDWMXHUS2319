using Application.DTOs.Post;


namespace Application.CQRS.Commands.Posts
{
    public class UpdatePostCommandHandle : IRequestHandler<UpdatePostCommand, ResponseModel<UpdatePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IFileService _fileService;
        private readonly IRedisService _redisService;

        public UpdatePostCommandHandle(IUserContextService userContextService, IUnitOfWork unitOfWork, IGeminiService geminiService, IFileService fileService, IRedisService redisService)
        {
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
            _fileService = fileService;
            _redisService = redisService;
        }
        public async Task<ResponseModel<UpdatePostDto>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            if (post == null)
                return ResponseFactory.NotFound<UpdatePostDto>("Post not found", 404);

            if (post.UserId != userId)
                return ResponseFactory.Fail<UpdatePostDto>("Bạn không có quyền chỉnh sửa bài viết này", 403);
            if (user == null)
                return ResponseFactory.Fail<UpdatePostDto>("Người dùng không tồn tại", 404);
            if (user.Status == "Suspended")
                return ResponseFactory.Fail<UpdatePostDto>("Tài khoản đang bị tạm ngưng", 403);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // ✅ Kiểm duyệt nội dung AI
                if (request.Content !=null  && !await _geminiService.ValidatePostContentAsync(request.Content))
                {
                    post.RejectAI();
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<UpdatePostDto>("Warning! Content is not accepted!", 400);
                }

                // ✅ Xử lý ảnh
                string? imageUrl = post.ImageUrl;  // Giữ ảnh cũ nếu không có ảnh mới
                if (request.Image != null && request.Image.Length > 0)  // Nếu có ảnh mới
                {
                    if (_fileService.IsImage(request.Image))  // Kiểm tra ảnh hợp lệ
                        imageUrl = await _fileService.SaveFileAsync(request.Image, "images/posts", true);  // Lưu ảnh mới
                }
                else if (request.IsDeleteImage)  // Nếu người dùng muốn xóa ảnh
                {
                    imageUrl = null;  // Gán null cho imageUrl nếu xóa ảnh
                }

                // ✅ Xử lý video
                string? videoUrl = post.VideoUrl;  // Giữ video cũ nếu không có video mới
                if (request.Video != null && request.Video.Length > 0)  // Nếu có video mới
                {
                    if (_fileService.IsVideo(request.Video))  // Kiểm tra video hợp lệ
                        videoUrl = await _fileService.SaveFileAsync(request.Video, "videos/posts", false);  // Lưu video mới
                }
                else if (request.IsDeleteVideo)  // Nếu người dùng muốn xóa video
                {
                    videoUrl = null;  // Gán null cho videoUrl nếu xóa video
                }

                // ✅ Kiểm tra có thay đổi không
                if (post.Content == request.Content &&
                    post.ImageUrl == imageUrl &&
                    post.VideoUrl == videoUrl &&
                    post.Scope == (request.Scope ?? post.Scope))
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Success(new UpdatePostDto
                    {
                        Id = post.Id,
                        UserId = post.UserId,
                        Content = post.Content,
                        ImageUrl = imageUrl != null ? $"{Constaint.baseUrl}{imageUrl}" : null,  // Trả về ảnh cũ hoặc null nếu không có ảnh
                        VideoUrl = videoUrl != null ? $"{Constaint.baseUrl}{videoUrl}" : null,  // Trả về video mới nếu có, hoặc null nếu không có video
                        Scope = (int)post.Scope,
                        IsApproved = post.IsApproved,
                        UpdatedAt = post.UpdateAt.GetValueOrDefault(post.CreatedAt)
                    }, "Không có thay đổi nào trong bài viết", 200);
                }

                // ✅ Cập nhật bài viết
                post.UpdatePost(request.Content, imageUrl, videoUrl, request.Scope ?? post.Scope);

                // ✅ Lưu thay đổi vào DB
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                if (request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }
                return ResponseFactory.Success(new UpdatePostDto
                {
                    Id = post.Id,
                    UserId = post.UserId,
                    Content = post.Content,
                    ImageUrl = imageUrl != null ? $"{Constaint.baseUrl}{imageUrl}" : null,  // Trả về ảnh cũ hoặc null nếu không có ảnh
                    VideoUrl = videoUrl != null ? $"{Constaint.baseUrl}{videoUrl}" : null,  // Trả về video mới nếu có
                    Scope = (int)post.Scope,
                    IsApproved = post.IsApproved,
                    UpdatedAt = post.UpdateAt.GetValueOrDefault(post.CreatedAt)
                }, "Chỉnh sửa bài viết thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                Console.WriteLine($"Lỗi khi cập nhật bài viết: {ex}");
                return ResponseFactory.Error<UpdatePostDto>("Đã xảy ra lỗi, vui lòng thử lại", 500, ex);
            }
        }
    }
}
