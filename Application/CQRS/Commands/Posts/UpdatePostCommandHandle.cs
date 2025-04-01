using Application.Common;
using Application.DTOs.Post;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.CQRS.Commands.Posts
{
    public class UpdatePostCommandHandle : IRequestHandler<UpdatePostCommand, ResponseModel<UpdatePostDto>>
    {
        private readonly IUserContextService _userContextService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly IFileService _fileService;

        public UpdatePostCommandHandle(IUserContextService userContextService, IUnitOfWork unitOfWork, IGeminiService geminiService, IFileService fileService)
        {
            _userContextService = userContextService;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
            _fileService = fileService;
        }
        public async Task<ResponseModel<UpdatePostDto>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();
            var post = await _unitOfWork.PostRepository.GetByIdAsync(request.PostId);

            if (post == null)
                return ResponseFactory.NotFound<UpdatePostDto>("Post not found", 404);

            if (post.UserId != userId)
                return ResponseFactory.Fail<UpdatePostDto>("Bạn không có quyền chỉnh sửa bài viết này", 403);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // ✅ Kiểm duyệt nội dung AI
                if (!await _geminiService.ValidatePostContentAsync(request.Content))
                {
                    post.RejectAI();
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<UpdatePostDto>("Warning! Content is not accepted!", 400);
                }

                // ✅ Kiểm tra & xử lý hình ảnh
                string? imageUrl = request.Image == null ? null : post.ImageUrl;
                if (request.Image != null && _fileService.IsImage(request.Image))
                    imageUrl = await _fileService.SaveFileAsync(request.Image, "images/posts", true);

                // ✅ Kiểm tra & xử lý video
                string? videoUrl = request.Video == null ? null : post.VideoUrl;
                if (request.Video != null && _fileService.IsVideo(request.Video))
                    videoUrl = await _fileService.SaveFileAsync(request.Video, "videos/posts", false);

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
                        ImageUrl = null, // Trả về null nếu không có ảnh
                        VideoUrl = null, // Trả về null nếu không có video
                        IsApproved = post.IsApproved,
                        UpdatedAt = post.UpdateAt.GetValueOrDefault(post.CreatedAt)
                    }, "Không có thay đổi nào trong bài viết", 200);
                }

                // ✅ Cập nhật bài viết
                post.UpdatePost(request.Content, imageUrl, videoUrl, request.Scope ?? post.Scope);

                // ✅ Lưu thay đổi vào DB
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return ResponseFactory.Success(new UpdatePostDto
                {
                    Id = post.Id,
                    UserId = post.UserId,
                    Content = post.Content,
                    ImageUrl = imageUrl != null ? $"{Constaint.baseUrl}{imageUrl}" : null,
                    VideoUrl = videoUrl != null ? $"{Constaint.baseUrl}{videoUrl}" : null,
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
