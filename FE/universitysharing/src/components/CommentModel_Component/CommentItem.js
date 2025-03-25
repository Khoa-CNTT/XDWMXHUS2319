import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";

const CommentItem = ({ comments }) => {
  return (
    <div className="comment-wrapper">
      <div className="comment">
        <img
          className="avatar"
          src={comments.profilePicture || avatarDefaut}
          alt="Avatar"
        />
        <div className="comment-content">
          <span className="comment-username">{comments.userName}</span>
          <p></p>
          <span className="comment-text">{comments.content}</span>
        </div>
        <img className="more-options" src={moreIcon} alt="More" />
      </div>

      {/* Like và Trả lời */}
      <div className="comment-actions">
        <img
          className="like-icon"
          src={comments.hasLiked ? likeIconFill : likeIcon}
          alt="Like"
          //onClick={() => handleLikeComment(comment.id)}
        />
        <span className="number-like">{comments.likeCountComment}</span>
        <span
          className="reply"
          //onClick={() => handleReplyClick(comment.id)}
        >
          Trả lời
        </span>
      </div>

      {/* Reply bình luận */}
      {comments.replies.length > 0 && (
        <div className="reply-section">
          {comments.replies.map((reply) => (
            <>
              <div key={reply.id} className="reply-comment">
                <img
                  className="avatar"
                  src={reply.profilePicture || avatarDefaut}
                  alt="Avatar"
                />
                <div className="reply-content">
                  <span className="reply-username">{reply.userName}</span>
                  <p></p>
                  <span className="reply-text">{reply.content}</span>
                </div>
                <img className="more-options" src={moreIcon} alt="More" />
              </div>
              <div className="comment-rely-actions">
                <img
                  className="like-rely-icon"
                  src={reply.hasLiked ? likeIconFill : likeIcon}
                  alt="Like"
                  //onClick={() => handleLikeCommentRely(reply.id)}
                />
                <span className="number-rely-like">
                  {reply.likeCountComment}
                </span>
                <span
                  className="reply-comment"
                  //onClick={() => handleReplyClick(comment.id)}
                >
                  Trả lời
                </span>
              </div>
              {/* <div ref={relyScroll}></div> */}
            </>
          ))}
        </div>
      )}

      {/* Hiển thị input reply nếu người dùng nhấn "Trả lời" */}

      {/* {replyingTo === comments.id && (
        <>
          <div className="reply-input">
            <textarea
              type="text"
              placeholder="Trả lời bình luận..."
              value={replyText}
              // onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="submit"
              // onClick={() => replyComment(comment.id)}
            >
              Trả lời
            </button>
          </div>
          {/* <div ref={replyInputRef} /> *
        </>
      )} */}

      {/* <div ref={replyInputRef} /> */}
    </div>
  );
};

export default CommentItem;
