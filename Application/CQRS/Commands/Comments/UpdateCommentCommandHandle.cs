using Application.DTOs.Comments;


namespace Application.CQRS.Commands.Comments
{
    public class UpdateCommentCommandHandle : IRequestHandler<UpdateCommentCommand, ResponseModel<CommentPostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        private readonly IRedisService _redisService;
        public UpdateCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService,IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _redisService = redisService;
        }
            public async Task<ResponseModel<CommentPostDto>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
            {
                var userId = _userContextService.UserId();

                //Tìm bài post xem có tồn tại không
                var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
                if (post == null)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy bài viết này", 404);
                }
            
                //Tìm comment xem có tồn tại không
                var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);
                if (comment == null)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy bình luận này", 404);
                }

                // Kiểm tra xem user có quyền chỉnh sửa comment hay không
                if (comment.UserId != userId)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Bạn không có quyền chỉnh sửa bình luận này", 403);
                }

                //Kiểm tra xem nội dung bình luận có rỗng không
                if (request.Content == null)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Nội dung bình luận không được để trống", 400);
                }
            
                //Kiểm tra xem bình luận có thuộc bài viết không
                if (request.PostId != comment.PostId)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Bình luận không thuộc bài viết này", 400);
                }

                //Kiểm tra xem nội dung bình luận có hợp lệ không
                if (!await _geminiService.ValidatePostContentAsync(request.Content))
                {
                    return ResponseFactory.Fail<CommentPostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return ResponseFactory.Fail<CommentPostDto>("Không tìm thấy người dùng", 404);
                }
                if (user.Status == "Suspended")
                {
                    return ResponseFactory.Fail<CommentPostDto>("Tài khoản đang bị tạm ngưng", 403);
                }
                await _unitOfWork.BeginTransactionAsync();
                    try
                    {
                    comment.Edit(request.Content);
                        await _unitOfWork.CommentRepository.UpdateAsync(comment);
                        await _unitOfWork.SaveChangesAsync();
                        await _unitOfWork.CommitTransactionAsync();
                    if (request.redis_key != null)
                    {
                        var key = $"{request.redis_key}";
                        await _redisService.RemoveAsync(key);
                    }
                    return ResponseFactory.Success(Mapping.MapToCommentPostDto(comment, post, user), "Chỉnh sửa bình luận thành công", 200);
                    }
                    catch (Exception ex)
                    {
                        await _unitOfWork.RollbackTransactionAsync();
                        return ResponseFactory.Fail<CommentPostDto>(ex.Message, 500);
                    }       
        }
    }
}
