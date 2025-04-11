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
  onLoadMore, // New prop for loading more comments
  isLoadingMore, // New prop to track loading state
  hasMoreComments, // New prop to check if more comments exist
}) => {
  // console.log("Danh sách bình luận ở CommentList:", comment);
  const dispatch = useDispatch();
  const userId = getUserIdFromToken();
  const handleReplyComment = debounce((commentId, content) => {
    if (!content.trim()) return;
    dispatch(
      replyComments({
        postId: post.id, // ID bài viết
        parentId: commentId, // ID của comment đang reply
        content: content, // Nội dung trả lời
        userId: userId,
      })
    );
  }, 1000);
  return (
    <div className="comments-section">
      {Array.isArray(comment) && comment.length > 0 ? (
        <>
          {comment.map((comments) => (
            <CommentItem
              key={comments.id}
              comments={comments}
              handleLikeComment={handleLikeComment}
              post={post}
              handleReplyComment={handleReplyComment}
              usersProfile={usersProfile}
            />
          ))}

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="comment-loading">Đang tải thêm bình luận...</div>
          )}
        </>
      ) : (
        <span>Không có bình luận nào</span>
      )}

      {/* Sentinel element for infinite scroll */}
      <div ref={commentEndRef} style={{ height: "1px" }} />
    </div>
  );
};

export default CommentList;
