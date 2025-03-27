import React, { useState, useEffect, useRef } from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeIconFill from "../../assets/iconweb/likefillIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";

const CommentItem = ({ comments, handleLikeComment }) => {
  const [isReplying, setIsReplying] = useState(false); // Kiểm soát hiển thị input
  const [replyText, setReplyText] = useState(""); // Lưu nội dung nhập vào
  const [replyingCommentId, setReplyingCommentId] = useState(null); // Lưu ID của comment đang được trả lời
  const [replyingTo, setReplyingTo] = useState(""); // Lưu tên người được trả lời

  const replyInputTargert = useRef(null);

  const handleReplyClick = (commentId, userName) => {
    setReplyingTo(userName); // Lưu tên người được trả lời
    setReplyingCommentId(commentId); // Cập nhật commentId đang trả lời
    setIsReplying(!isReplying); // Khi click, đảo trạng thái true/false
    setReplyText(`@${userName} `); // Gán sẵn nội dung
    setTimeout(() => {
      if (replyInputTargert.current) {
        replyInputTargert.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };
  const handleChange = (e) => {
    const text = e.target.value;

    // Luôn giữ phần "@TênNgườiDùng " không bị xóa
    if (!text.startsWith(`@${replyingTo} `)) {
      // setReplyText(`@${replyingTo} `);
      setReplyText(e.target.value); // Không bắt buộc giữ @TênNgườiDùng
    } else {
      setReplyText(text);
    }
  };

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
          onClick={() => handleLikeComment(comments.id)}
        />
        <span className="number-like">{comments.likeCountComment}</span>
        <span
          className="reply"
          onClick={() => handleReplyClick(comments.id, comments.userName)}
        >
          Trả lời
        </span>
      </div>

      {/* Reply bình luận */}
      {comments.replies?.length > 0 && (
        <div className="reply-section">
          {comments.replies.map((reply) => (
            <React.Fragment key={reply.id}>
              <div className="reply-comment">
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
                  onClick={() => handleLikeComment(reply.id)}
                />
                <span className="number-rely-like">
                  {reply.likeCountComment}
                </span>
                <span
                  className="reply-comment"
                  onClick={() => handleReplyClick(reply.id, reply.userName)}
                >
                  Trả lời
                </span>
              </div>
              {/* <div ref={relyScroll}></div> */}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Hiển thị input reply nếu người dùng nhấn "Trả lời" */}

      {isReplying && (
        <>
          <div className="reply-input">
            <textarea
              type="text"
              placeholder="Trả lời bình luận..."
              // value={replyText}
              value={replyText}
              onChange={handleChange}
            />
            <button
              type="submit"
              // onClick={() => replyComment(comment.id)}
            >
              Trả lời
            </button>
          </div>
          <div ref={replyInputTargert} />
        </>
      )}

      {/* <div ref={replyInputRef} /> */}
    </div>
  );
};

export default CommentItem;
