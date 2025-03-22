import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";

const CommentItem = ({
  comment,
  handleLikeComment,
  handleLikeCommentRely,
  handleReplyClick,
  replyingTo,
  replyText,
  setReplyText,
  replyComment,
  replyInputRef,
  relyScroll,
}) => {
  return (
    <div className="comment-wrapper">
      <div className="comment">
        <img className="avatar" src={avatarDefaut} alt="Avatar" />
        <div className="comment-content">
          <span className="comment-username">{comment.username}</span>
          <p></p>
          <span className="comment-text">{comment.text}</span>
        </div>
        <img className="more-options" src={moreIcon} alt="More" />
      </div>

      {/* Like và Trả lời */}
      <div className="comment-actions">
        <img
          className="like-icon"
          src={comment.islike ? likeIconFill : likeIcon}
          alt="Like"
          onClick={() => handleLikeComment(comment.id)}
        />
        <span className="number-like">{comment.likes}</span>
        <span className="reply" onClick={() => handleReplyClick(comment.id)}>
          Trả lời
        </span>
      </div>

      {/* Reply bình luận */}
      <div className="reply-section">
        {comment.replies.map((reply) => (
          <>
            <div key={reply.id} className="reply-comment">
              <img className="avatar" src={avatarDefaut} alt="Avatar" />
              <div className="reply-content">
                <span className="reply-username">{reply.username}</span>
                <p></p>
                <span className="reply-text">{reply.text}</span>
              </div>
              <img className="more-options" src={moreIcon} alt="More" />
            </div>
            <div className="comment-rely-actions">
              <img
                className="like-rely-icon"
                src={reply.islike ? likeIconFill : likeIcon}
                alt="Like"
                onClick={() => handleLikeCommentRely(reply.id)}
              />
              <span className="number-rely-like">{reply.likes}</span>
              <span
                className="reply-comment"
                onClick={() => handleReplyClick(comment.id)}
              >
                Trả lời
              </span>
            </div>
            <div ref={relyScroll}></div>
          </>
        ))}
      </div>

      {/* Hiển thị input reply nếu người dùng nhấn "Trả lời" */}
      {replyingTo === comment.id && (
        <>
          <div className="reply-input">
            <textarea
              type="text"
              placeholder="Trả lời bình luận..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit" onClick={() => replyComment(comment.id)}>
              Trả lời
            </button>
          </div>
          <div ref={replyInputRef} />
        </>
      )}
      {/* <div ref={replyInputRef} /> */}
    </div>
  );
};

export default CommentItem;
