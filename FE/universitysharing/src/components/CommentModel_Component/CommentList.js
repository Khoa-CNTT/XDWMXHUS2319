import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import CommentItem from "./CommentItem";
const CommentList = ({
  comments,
  handleLikeComment,
  handleLikeCommentRely,
  handleReplyClick,
  replyingTo,
  replyText,
  setReplyText,
  replyComment,
  replyInputRef,
  commentsEndRef,
  relyScroll,
}) => {
  return (
    <div className="comments-section">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          handleLikeComment={handleLikeComment}
          handleLikeCommentRely={handleLikeCommentRely}
          handleReplyClick={handleReplyClick}
          replyingTo={replyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          replyComment={replyComment}
          replyInputRef={replyInputRef}
          relyScroll={relyScroll}
        />
      ))}
      {/* Thẻ ẩn giúp scroll xuống bình luận mới nhất */}
      <div ref={commentsEndRef} />
    </div>
  );
};

export default CommentList;
