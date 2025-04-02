using Application.DTOs.Comments;
using Application.DTOs.Shares;
using Application.Interface.Api;
using Application.Interface.ContextSerivce;
using Application.Interface.Hubs;
using Domain.Entities;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Application.CQRS.Commands.Comments
{
    public class ReplyCommentCommandHandle : IRequestHandler<ReplyCommentCommand, ResponseModel<ResultCommentDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly IGeminiService _geminiService;
        private readonly INotificationService _notificationService;

        public ReplyCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, IGeminiService geminiService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _geminiService = geminiService;
            _notificationService = notificationService;
        }
        public async Task<ResponseModel<ResultCommentDto>> Handle(ReplyCommentCommand request, CancellationToken cancellationToken)
        {
            // Lấy UserId từ context
            var userId = _userContextService.UserId();
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Người dùng không tồn tại", 404);
            }

            // Kiểm tra bình luận cha có tồn tại không
            var parentComment = await _unitOfWork.CommentRepository.GetByIdAsync(request.ParentCommentId);
            if (parentComment == null)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Bình luận này không tồn tại", 404);
            }

            if (request.PostId != parentComment.PostId && request.PostId != Guid.Empty)
            {
                return ResponseFactory.Fail<ResultCommentDto>("Bình luận này không thuộc bài viết này", 400);
            }

            // Kiểm tra nội dung bình luận
            if (!await _geminiService.ValidatePostContentAsync(request.Content))
            {
                return ResponseFactory.Fail<ResultCommentDto>("Warning! Content is not accepted! If you violate it again, your reputation will be deducted!!", 400);
            }

            // 📌 Xác định cấp độ của bình luận cha
            int depth = 1;
            var currentComment = parentComment;
            while (currentComment.ParentCommentId != null)
            {
                depth++;
                currentComment = await _unitOfWork.CommentRepository.GetByIdAsync(currentComment.ParentCommentId.Value);
                if (currentComment == null) break;
            }

            // 📌 Nếu comment cha ở tầng 3, đặt ParentCommentId về tầng 2
            Guid? finalParentId = depth >= 2 ? parentComment.ParentCommentId : parentComment.Id;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Tạo bình luận phản hồi
                var replyComment = new Comment(userId, parentComment.PostId, request.Content ?? "")
                {
                    ParentCommentId = finalParentId
                };

                // Thêm vào database
                await _unitOfWork.CommentRepository.AddAsync(replyComment);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                // 🔥 Publish sự kiện bình luận để gửi thông báo qua SignalR
                if (parentComment.UserId != userId)
                {
                    await _notificationService.SendReplyNotificationAsync(parentComment.PostId,request.ParentCommentId, userId, user.FullName);
                }
                return ResponseFactory.Success(Mapping.MapToResultCommentPostDto(replyComment, user.FullName, user.ProfilePicture), "Phản hồi bình luận thành công", 201);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<ResultCommentDto>("Lỗi khi phản hồi bình luận", 500, ex);
            }
        }
    }
}
