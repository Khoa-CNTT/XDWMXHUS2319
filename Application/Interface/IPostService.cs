﻿using Application.DTOs.Post;
using Application.DTOs.Shares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Enums;

namespace Application.Interface
{
    public interface IPostService
    {
        Task<Guid> GetPostOwnerId(Guid postId);
        Task<GetPostsResponse> GetPostsWithCursorAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken);
        Task<GetPostsResponse> GetPostsByOwnerWithCursorAsync(Guid? lastPostId, int pageSize, CancellationToken cancellationToken);
        Task<GetPostsResponse> GetPostByTypeWithCursorAsync(PostTypeEnum postTypeEnum, Guid? lastPostId, int pageSize, CancellationToken cancellationToken);
        Task<bool> IsUserSpammingSharesAsync(Guid userId, Guid postId);

        Task SoftDeletePostAndRelatedDataAsync(Guid postId);
        Task SoftDeleteCommentAndRepliesAsync(Guid commentId);
    }
}
