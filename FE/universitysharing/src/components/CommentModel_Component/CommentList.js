import React from "react";
import "../../styles/CommentOverlay.scss";
import CommentItem from "./CommentItem";

const CommentList = ({ comment, commentEndRef, handleLikeComment }) => {
  // console.log("Danh sách bình luận ở CommentList:", comment);
  return (
    <div className="comments-section">
      {Array.isArray(comment) && comment.length > 0 ? (
        comment.map((comments) => (
          <CommentItem
            key={comments.id}
            comments={comments}
            handleLikeComment={handleLikeComment}
          ></CommentItem>
        ))
      ) : (
        <span>Không có bình luận nào</span>
      )}

      {/* Thẻ ẩn giúp scroll xuống bình luận mới nhất */}
      <div ref={commentEndRef} />
    </div>
  );
};

export default CommentList;
