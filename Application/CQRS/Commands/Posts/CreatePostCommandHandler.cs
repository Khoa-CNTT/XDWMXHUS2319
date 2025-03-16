using Application.DTOs.Post;
using Application.Interface.ContextSerivce;
using Application.Services;


namespace Application.CQRS.Commands.Posts
{
    public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, ResponseModel<ResponsePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly MLService _mLService;
        public CreatePostCommandHandler(IUnitOfWork unitOfWork,MLService mLService, IUserContextService userContextService, IGeminiService geminiService)
        {
            _unitOfWork = unitOfWork;
            _mLService = mLService;
            _userContextService = userContextService;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<ResponsePostDto>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var userId = _userContextService.UserId();
                if (userId == Guid.Empty)
                    return ResponseFactory.Fail<ResponsePostDto>("User not found", 404);

                var post = new Post(userId, request.Content, request.PostType,request.Scope, request.ImageUrl, request.VideoUrl);

               
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
                    Id = userId,
                    Content = post.Content,
                    PostType = post.PostType,
                    IsApproved = post.IsApproved,
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
