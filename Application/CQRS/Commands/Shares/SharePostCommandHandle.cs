using Application.DTOs.Post;
using Application.DTOs.Shares;
using Application.Interface;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Shares
{
    public class SharePostCommandHandle : IRequestHandler<SharePostCommand, ResponseModel<SharePostDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        public SharePostCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
        }
        public async Task<ResponseModel<SharePostDto>> Handle(SharePostCommand request, CancellationToken cancellationToken)
        {
            /*await _unitOfWork.BeginTransactionAsync();
            try
            {
                //Lấy UserId từ UserContextService
                var userId = _userContextService.UserId();
                //Lấy Bài post từ request  từ client vào
                var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
                if (post == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<SharePostDto>("Không tìm thấy bài viết này", 404);
                }
                // Kiểm tra số lần share của user đối với bài viết này
                // Nếu trong vòng 5 phút user đã share bài viết này quá 3 lần thì không cho share nữa
                var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
                var shareCount = await _unitOfWork.ShareRepository.CountPostShareAsync(s => s.UserId == userId && s.PostId == request.PostId && s.CreatedAt >= fiveMinutesAgo);
                if (shareCount >= 3)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<SharePostDto>("Bạn đã chia sẻ bài viết này quá số lần cho phép trong thời gian ngắn. Cảnh báo spam!", 403);
                }
                // Lấy thông tin người dùng chia sẻ
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

                //Tạo Share mới
                var share = new Share(userId, request.PostId, request.Content);
                await _unitOfWork.ShareRepository.AddAsync(share);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return ResponseFactory.Success(Mapping.MapToSharePostDto(share, post, user), "Chia sẻ bài viết thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<SharePostDto>("Lỗi Error", 500, ex);
            }            */
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Lấy UserId từ UserContextService
                var userId = _userContextService.UserId();

                // Lấy bài Post gốc
                var originalPost = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);
                if (originalPost == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<SharePostDto>("Không tìm thấy bài viết để chia sẻ", 404);
                }

                // Kiểm tra số lần share trong 5 phút gần nhất
                var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
                var shareCount = await _unitOfWork.ShareRepository.CountPostShareAsync(p =>
                    p.UserId == userId &&
                    p.PostId == request.PostId &&
                    p.CreatedAt >= fiveMinutesAgo);

                if (shareCount >= 3)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<SharePostDto>("Bạn đã chia sẻ bài viết này quá số lần cho phép trong thời gian ngắn. Cảnh báo spam!", 403);
                }

                // Lấy thông tin người dùng chia sẻ
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

                // **Tạo bài Share**
                var share = new Share(userId, request.PostId, request.Content);
                await _unitOfWork.ShareRepository.AddAsync(share);

                // **Tạo bài Post mới có IsSharedPost = true**
                var sharedPost = Post.CreateShare(userId, originalPost, request.Content ?? "");
                var result = await _geminiService.ValidatePostContentAsync(sharedPost.Content);
                if (!result)
                {
                    sharedPost.RejectAI();
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<SharePostDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
                }
                sharedPost.ApproveAI();
                sharedPost.IsShare();
                await _unitOfWork.PostRepository.AddAsync(sharedPost);

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(
                    Mapping.MapToSharePostDto(share, originalPost, user), // ⚠️ Truyền `share` thay vì `sharedPost`
                    "Chia sẻ bài viết thành công",
                    200
                );
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<SharePostDto>("Lỗi trong quá trình chia sẻ", 500, ex);
            }
        }
    }
}
