import React, { useState, useRef, useEffect } from "react";
// import "../../styles/CommentOverlay.scss";
import "../../styles/CommentModalNoImg.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import {
  FiMoreHorizontal,
  FiMessageSquare,
  FiHeart,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { getReplyComment } from "../../stores/action/listPostActions";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import CommentOption from "./CommentOption";
import getUserIdFromToken from "../../utils/JwtDecode";

const CommentItem = ({
  comments,
  handleLikeComment,
  post,
  handleReplyComment,
  usersProfile,
}) => {
  const dispatch = useDispatch();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState("");
  const [openOptionId, setOpenOptionId] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState(1); // Chỉ hiển thị 1 reply ban đầu
  const [isRepliesHidden, setIsRepliesHidden] = useState(false); // Trạng thái ẩn/hiện replies

  const replyInputRef = useRef(null);
  const moreReplyRef = useRef(null);
  const menuRef = useRef(null);
  const repliesContainerRef = useRef(null);
  const userId = getUserIdFromToken();

  // Xử lý khi click nút trả lời
  const handleReplyClick = (commentId, userName) => {
    setReplyingTo(userName);
    setReplyingCommentId(commentId);
    setIsReplying(!isReplying);
    setReplyText(`@${userName} `);

    // Mở replies nếu đang ẩn
    if (isRepliesHidden) {
      setIsRepliesHidden(false);
    }

    setTimeout(() => {
      replyInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  // Gửi reply
  const handleSendReply = () => {
    if (!replyingCommentId || !replyText.trim()) return;
    handleReplyComment(replyingCommentId, replyText);
    setIsReplying(false);
    setReplyText("");
  };

  // Xử lý thay đổi nội dung reply
  const handleChange = (e) => {
    setReplyText(e.target.value);
  };

  // Load thêm replies
  const handleLoadMoreReplies = debounce(() => {
    if (comments.hasMoreReplies) {
      dispatch(getReplyComment(comments.id));
    } else {
      // Hiển thị thêm replies đã load
      setVisibleReplies((prev) => prev + 3);
    }

    setTimeout(() => {
      moreReplyRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  }, 500);

  // Toggle ẩn/hiện replies
  const toggleRepliesVisibility = () => {
    setIsRepliesHidden(!isRepliesHidden);
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenOptionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động mở rộng textarea khi nội dung nhiều
  useEffect(() => {
    if (replyInputRef.current) {
      const textarea = replyInputRef.current.querySelector("textarea");
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [replyText]);

  // Lấy số lượng replies hiển thị
  const displayedReplies = comments.replies?.slice(0, visibleReplies) || [];
  const hasHiddenReplies =
    comments.replies?.length > visibleReplies || comments.hasMoreReplies;
  const totalReplyCount = comments.replyCount || comments.replies?.length || 0;

  return (
    <div className="comment-item">
      {/* Comment chính */}
      <div className="comment-main">
        <img
          className="comment-avatar"
          src={comments.profilePicture || avatarDefaut}
          alt="Avatar"
        />

        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{comments.userName}</span>

            <button
              className="comment-more-btn"
              onClick={() =>
                setOpenOptionId(
                  openOptionId === comments.id ? null : comments.id
                )
              }
            >
              <FiMoreHorizontal size={18} />
            </button>

            {openOptionId === comments.id && (
              <div ref={menuRef} className="comment-options-container">
                <CommentOption
                  isOwner={userId === comments.userId}
                  onClose={() => setOpenOptionId(null)}
                  idComment={comments.id}
                  post={post}
                />
              </div>
            )}
          </div>

          <div className="comment-content">{comments.content}</div>

          <div className="comment-actions">
            <button
              className={`action-btn ${comments.hasLiked ? "liked" : ""}`}
              onClick={() => handleLikeComment(comments.id)}
            >
              {comments.hasLiked ? (
                <FaHeart className="like-icon" size={16} />
              ) : (
                <FiHeart className="like-icon" size={16} />
              )}
              <span className="action-count">{comments.likeCountComment}</span>
            </button>

            <button
              className="action-btn"
              onClick={() => handleReplyClick(comments.id, comments.userName)}
            >
              <FiMessageSquare className="reply-icon" size={16} />
              <span className="action-text">Trả lời</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nút hiển thị/ẩn replies */}
      {totalReplyCount > 0 && (
        <button
          className="toggle-replies-btn"
          onClick={toggleRepliesVisibility}
        >
          {isRepliesHidden ? (
            <>
              <FiChevronDown size={16} />
              <span>Hiển thị {totalReplyCount} bình luận</span>
            </>
          ) : (
            <>
              <FiChevronUp size={16} />
              <span>Ẩn bình luận</span>
            </>
          )}
        </button>
      )}

      {/* Các reply - chỉ hiển thị khi không bị ẩn */}
      {!isRepliesHidden && displayedReplies.length > 0 && (
        <div className="replies-container" ref={repliesContainerRef}>
          {displayedReplies.map((reply) => (
            <div key={reply.id} className="reply-item">
              <img
                className="reply-avatar"
                src={reply.profilePicture || avatarDefaut}
                alt="Avatar"
              />

              <div className="reply-body">
                <div className="reply-header">
                  <span className="reply-author">{reply.userName}</span>

                  <button
                    className="reply-more-btn"
                    onClick={() =>
                      setOpenOptionId(
                        openOptionId === reply.id ? null : reply.id
                      )
                    }
                  >
                    <FiMoreHorizontal size={16} />
                  </button>

                  {openOptionId === reply.id && (
                    <div ref={menuRef} className="comment-options-container">
                      <CommentOption
                        isOwner={userId === reply.userId}
                        onClose={() => setOpenOptionId(null)}
                        idComment={reply.id}
                        post={post}
                      />
                    </div>
                  )}
                </div>

                <div className="reply-content">{reply.content}</div>

                <div className="reply-actions">
                  <button
                    className={`action-btn ${reply.hasLiked ? "liked" : ""}`}
                    onClick={() => handleLikeComment(reply.id)}
                  >
                    {reply.hasLiked ? (
                      <FaHeart className="like-icon" size={14} />
                    ) : (
                      <FiHeart className="like-icon" size={14} />
                    )}
                    <span className="action-count">
                      {reply.likeCountComment}
                    </span>
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => handleReplyClick(reply.id, reply.userName)}
                  >
                    <FiMessageSquare className="reply-icon" size={14} />
                    <span className="action-text">Trả lời</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={moreReplyRef} />
        </div>
      )}

      {/* Nút xem thêm reply - chỉ hiển thị khi không bị ẩn */}
      {!isRepliesHidden && hasHiddenReplies && (
        <button className="view-more-replies" onClick={handleLoadMoreReplies}>
          {comments.hasMoreReplies
            ? "Tải thêm bình luận"
            : `Xem thêm ${comments.replies.length - visibleReplies} bình luận`}
        </button>
      )}

      {/* Ô nhập reply */}
      {isReplying && (
        <div className="reply-input-container" ref={replyInputRef}>
          <div className="reply-input-avatar">
            <img
              src={usersProfile.profilePicture || avatarDefaut}
              alt="Avatar"
            />
          </div>
          <div className="reply-input-wrapper">
            <div className="input-box">
              <textarea
                value={replyText}
                onChange={handleChange}
                placeholder="Viết phản hồi..."
                autoFocus
                rows="1"
              />
              <div className="input-actions">
                <button
                  className={`send-reply-btn ${
                    !replyText.trim() ? "disabled" : ""
                  }`}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke={!replyText.trim() ? "#BCC0C4" : "#1877F2"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke={!replyText.trim() ? "#BCC0C4" : "#1877F2"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
