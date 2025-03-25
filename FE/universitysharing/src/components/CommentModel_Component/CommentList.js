import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import CommentItem from "./CommentItem";
import { useDispatch, useSelector } from "react-redux";
const CommentList = ({ comment }) => {
  const dispatch = useDispatch();
  console.log("Danh sách bình luận:", comment);
  return (
    <div className="comments-section">
      {Array.isArray(comment?.data) && comment.data.length > 0 ? (
        comment.data.map((comments) => (
          <CommentItem key={comments.id} comments={comments}></CommentItem>
        ))
      ) : (
        <span>Không có bình luận nào</span>
      )}

      {/* Thẻ ẩn giúp scroll xuống bình luận mới nhất */}
      {/* <div ref={commentsEndRef} /> */}
    </div>
  );
};

export default CommentList;
