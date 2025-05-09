using Application.Common;
using Application.DTOs.Post;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using static Domain.Common.Helper;
using static Domain.Common.Enums;
using Domain.Entities;
using StackExchange.Redis;
using Application.DTOs.Comments;



namespace Application.CQRS.Commands.Posts
{
    public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, ResponseModel<ResponsePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IFileService _fileService;
        private readonly IRedisService _redisService;

        public CreatePostCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, IFileService fileService, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _fileService = fileService;
            _redisService = redisService;
        }

        public async Task<ResponseModel<ResponsePostDto>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                if (userId == Guid.Empty)
                    return ResponseFactory.Fail<ResponsePostDto>("User not found", 404);
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if (user == null)                
                    return ResponseFactory.Fail<ResponsePostDto>("Người dùng không tồn tại", 404);                
                if (user.Status == "Suspended")
                    return ResponseFactory.Fail<ResponsePostDto>("Tài khoản đang bị tạm ngưng", 403);                
                // Lưu ảnh
                List<string> imageUrls = new();
                if (request.Images != null && request.Images.Any())
                {
                    foreach (var image in request.Images)
                    {
                        var imageUrl = await _fileService.SaveFileAsync(image, "images/posts", isImage: true);
                        if (!string.IsNullOrWhiteSpace(imageUrl))
                        {
                            imageUrls.Add(imageUrl);
                        }
                    }
                }

                // Gộp chuỗi ảnh lại bằng dấu phẩy
                string? imageUrlString = imageUrls.Any() ? string.Join(",", imageUrls) : null;

                // Lưu video (nếu có)
                string? videoUrl = null;
                if (request.Video != null)
                {
                    videoUrl = await _fileService.SaveFileAsync(request.Video, "videos/posts", isImage: false);
                }

                // Tạo post
                var post = new Post(userId, request.Content, request.Scope, imageUrlString, videoUrl);

                // Kiểm tra nội dung bằng Gemini
                var validationResult = await _geminiService.ValidatePostContentWithDetailsAsync(post.Content);

                // Xử lý trạng thái bài đăng
                if (!validationResult.IsValid)
                {
                    if (validationResult.Reason == "non-standard")
                    {
                        // Nội dung không chuẩn (như "haha"), đặt trạng thái Pending
                        post.SetPendingForManualReview();
                    }
                    else
                    {
                        // Nội dung vi phạm nghiêm trọng
                        post.RejectAI();
                    }
                }
                else
                {
                    // Nội dung hợp lệ
                    post.ApproveAI();
                }

                // Lưu bài đăng
                await _unitOfWork.PostRepository.AddAsync(post);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                // Tạo DTO cho phản hồi
                var postDto = new ResponsePostDto
                {
                    Id = post.Id,
                    UserId = userId,
                    Content = post.Content,
                    ImageUrl = post.ImageUrl != null ? $"{Constaint.baseUrl}{post.ImageUrl}" : null,
                    VideoUrl = post.VideoUrl != null ? $"{Constaint.baseUrl}{post.VideoUrl}" : null,
                    PostType = post.PostType,
                    Scope = post.Scope,
                    IsApproved = post.IsApproved,
                    CreatedAt = FormatUtcToLocal(post.CreatedAt),
                };
                if(request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }


                // Trả về phản hồi dựa trên trạng thái
                if (!validationResult.IsValid)
                {
                    if (validationResult.Reason == "non-standard")
                    {
                        return ResponseFactory.Fail<ResponsePostDto>("The post has not been approved and is pending", 201);
                    }
                    return ResponseFactory.Fail<ResponsePostDto>(
                        "Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!",
                        400
                    );
                }

                return ResponseFactory.Success(postDto, "Create Post Success", 200);
            }
            catch (Exception e)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Fail<ResponsePostDto>(e.Message, 500);
            }
        }
    }
}