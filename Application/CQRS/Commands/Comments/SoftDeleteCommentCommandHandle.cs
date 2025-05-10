﻿using Application.DTOs.Comments;
using Application.Interface.ContextSerivce;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Comments
{
    public class SoftDeleteCommentCommandHandle : IRequestHandler<SoftDeleteCommentCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserContextService _userContextService;
        private readonly ICommentService _commentService;
        private readonly IRedisService _redisService;
        public SoftDeleteCommentCommandHandle(IUnitOfWork unitOfWork, IUserContextService userContextService, ICommentService commentService, IRedisService redisService)
        {
            _unitOfWork = unitOfWork;
            _userContextService = userContextService;
            _commentService = commentService;
            _redisService = redisService;
        }
        public async Task<ResponseModel<bool>> Handle(SoftDeleteCommentCommand request, CancellationToken cancellationToken)
        {
            var userId = _userContextService.UserId();

            var comment = await _unitOfWork.CommentRepository.GetByIdAsync(request.CommentId);
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

            if (comment == null)
            {
                return ResponseFactory.Fail<bool>("Không tìm thấy bình luận này", 404);
            }
            if (comment.PostId == Guid.Empty)
            {
                return ResponseFactory.Fail<bool>("Bình luận không thuộc bài viết nào", 404);
            }
            if (comment.UserId != userId)
            {
                return ResponseFactory.Fail<bool>("Bạn không có quyền xóa bình luận này", 403);
            }
            if(userId  == Guid.Empty) {
                return ResponseFactory.Fail<bool>("Bạn cần đăng nhập để thực hiện chức năng này", 401);
            }
            if (comment.IsDeleted)
            {
                return ResponseFactory.Fail<bool>("Bình luận này đã bị xóa", 404);
            }
            if (user == null)
                return ResponseFactory.Fail<bool>("Người dùng không tồn tại", 404);
            if (user.Status == "Suspended")
                return ResponseFactory.Fail<bool>("Tài khoản đang bị tạm ngưng", 403);
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 🔥 Gọi service xử lý xóa comment, reply và like
                var isDeleted = await _commentService.SoftDeleteCommentWithRepliesAndLikesAsync(request.CommentId);

                if (!isDeleted)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return ResponseFactory.Fail<bool>("Không thể xóa bình luận", 400);
                }

                // 🔥 Lưu thay đổi vào database
                await _unitOfWork.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();
                if (request.redis_key != null)
                {
                    var key = $"{request.redis_key}";
                    await _redisService.RemoveAsync(key);
                }
                return ResponseFactory.Success(true, "Xóa bình luận và các phản hồi thành công", 200);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return ResponseFactory.Error<bool>("Lỗi Error", 500, ex);
            }
        }
    }
}
    