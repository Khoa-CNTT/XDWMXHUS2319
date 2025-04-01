using Application.Common;
using Application.DTOs.Post;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using static Domain.Common.Helper;
using static Domain.Common.Enums;



namespace Application.CQRS.Commands.Posts
{
    public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, ResponseModel<ResponsePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IFileService _fileService;

        public CreatePostCommandHandler(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, IFileService fileService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _fileService = fileService;
        }
        public async Task<ResponseModel<ResponsePostDto>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                if (userId == Guid.Empty)
                    return ResponseFactory.Fail<ResponsePostDto>("User not found", 404);

                // Kiểm tra và lưu ảnh
                string? imageUrl = request.Image != null ?
                    await _fileService.SaveFileAsync(request.Image, "images/posts", isImage: true) : null;

                // Kiểm tra và lưu video
                string? videoUrl = request.Video != null ?
                    await _fileService.SaveFileAsync(request.Video, "videos/posts", isImage: false) : null;

                var post = new Post(userId, request.Content, request.PostType, ScopeEnum.Public, imageUrl, videoUrl);
          
                //kiểm tra xem bài đăng có hợp lệ không bằng Genimi
               var result = await _geminiService.ValidatePostContentAsync(post.Content);
                if (!result)
                {
                    post.RejectAI();
                    await _unitOfWork.PostRepository.AddAsync(post);
                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();
                    return ResponseFactory.Fail<ResponsePostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                post.ApproveAI();
                // 🛑 Kiểm duyệt bài đăng bằng ML.NET
                //bool isValid = PostValidator.IsValid( post.Content , _mLService.Predict);
                //if (!isValid)
                //{
                //    post.RejectAI();
                //    await _unitOfWork.RollbackTransactionAsync();
                //    return ResponseFactory.Fail<ResponsePostDto>("Content is not valid", 400);
                //}
                //post.Approve();
                await _unitOfWork.PostRepository.AddAsync(post);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync(); // Thêm dòng này để commit nếu hợp lệ
                var postDto = new ResponsePostDto
                {
                    Id = post.Id,
                    UserId = userId,
                    Content = post.Content,
                    ImageUrl = post.ImageUrl != null ? $"{Constaint.baseUrl}{post.ImageUrl}" : null, // ✅ Thêm Base URL
                    VideoUrl = post.VideoUrl != null ? $"{Constaint.baseUrl}{post.VideoUrl}" : null, // ✅ Thêm Base URL
                    PostType = post.PostType,
                    IsApproved = post.IsApproved,
                    CreatedAt =FormatUtcToLocal(post.CreatedAt),
                };

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
