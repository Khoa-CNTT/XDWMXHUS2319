using Application.Interface;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly IUnitOfWork _unitOfWork;
        public CommentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

        }
        public async Task<Guid> GetCommentOwnerId(Guid commentId)
        {
            return await _unitOfWork.CommentRepository.GetCommentOwnerIdAsync(commentId);
        }
        public async Task<bool> SoftDeleteCommentWithRepliesAndLikesAsync(Guid commentId)
        {
            var comment = await _unitOfWork.CommentRepository.GetByIdAsync(commentId);
            if (comment == null || comment.IsDeleted)
            {
                return false;
            }

            var replies = await _unitOfWork.CommentRepository.GetRepliesByCommentIdAsync(commentId);
            var allCommentIds = replies.Select(r => r.Id).ToList();
            allCommentIds.Add(commentId);

            // 🔥 Xóa mềm comment gốc và reply
            comment.Delete();
            replies.ForEach(reply => reply.Delete());

            // 🔥 Lấy danh sách Like của các comment cần xóa mềm
            var likes = await _unitOfWork.CommentLikeRepository.GetLikesByCommentIdsAsync(allCommentIds);

            // 🔥 Xóa mềm tất cả Like
            likes.ForEach(like => like.UnLike());

            return true;
        }
    }
}
