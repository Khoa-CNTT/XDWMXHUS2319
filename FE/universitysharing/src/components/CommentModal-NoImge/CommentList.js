import React, { useEffect } from "react";
import "../../styles/CommentOverlay.scss";
import CommentItem from "./CommentItem";
import { debounce } from "lodash";
import { replyComments } from "../../stores/action/listPostActions";
import { useDispatch, useSelector } from "react-redux";
import getUserIdFromToken from "../../utils/JwtDecode";

const CommentList = ({
  comment,
  commentEndRef,
  handleLikeComment,
  post,
  usersProfile,
  onLoadMore,
  isLoadingMore,
  hasMoreComments,
}) => {
  const dispatch = useDispatch();
  const userId = getUserIdFromToken();

  // Loại bỏ các bình luận trùng lặp dựa trên comment.id
  const uniqueComments = Array.from(
    new Map((comment || []).map((item) => [item.id, item])).values()
  );

  const handleReplyComment = debounce((commentId, content) => {
    if (!content.trim()) return;
    dispatch(
      replyComments({
        postId: post.id,
        parentId: commentId,
        content: content,
        userId: userId,
      })
    );
  }, 1000);

  return (
    <div className="comments-section">
      {Array.isArray(uniqueComments) && uniqueComments.length > 0 ? (
        <>
          {uniqueComments.map((comments) => (
            <CommentItem
              key={comments.id}
              comments={comments}
              handleLikeComment={handleLikeComment}
              post={post}
              handleReplyComment={handleReplyComment}
              usersProfile={usersProfile}
            />
          ))}

          {isLoadingMore && (
            <div className="comment-loading">Đang tải thêm bình luận...</div>
          )}
        </>
      ) : (
        <span>Không có bình luận nào</span>
      )}

      <div ref={commentEndRef} style={{ height: "1px" }} />
    </div>
  );
};

export default CommentList;
