import React from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../stores/action/listPostActions";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt
import {
  FiMoreHorizontal,
  FiX,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiClock,
} from "react-icons/fi";
import {
  openShareModal,
  closeShareModal,
} from "../../stores/reducers/listPostReducers";
import { FaHeart } from "react-icons/fa"; // Icon trái tim đầy cho trạng thái đã like

const ContentPostComment = ({ post, onClose }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) =>
    state.posts.posts.find((p) => p.id === post.id)
  );

  // Like bài viết: bỏ debounce, dispatch trực tiếp
  const handleLikePost = (postId) => {
    dispatch(likePost(postId));
  };

  // Hàm chuyển đổi UTC sang giờ Việt Nam (UTC+7)
  const convertUTCToVNTime = (utcDate) => {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 7); // Chuyển sang giờ Việt Nam
    return date;
  };

  if (!posts) return null; // Tránh lỗi nếu post chưa được truyền xuống

  return (
    <div className="content-post-comment">
      <div className="avatar-and-option">
        <div className="avatar-and-name">
          <img
            className="avatar"
            src={posts.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <div className="user-info">
            <span className="username">{posts.fullName}</span>
            <span className="Time-post-Comments-Modal">
              <FiClock size={12} style={{ marginRight: 4 }} />
              {formatDistanceToNow(convertUTCToVNTime(posts.createdAt), {
                addSuffix: true,
                locale: {
                  ...vi,
                  formatDistance: (token, count) => {
                    switch (token) {
                      case "lessThanXSeconds":
                        return "vài giây trước";
                      case "xSeconds":
                        return `${count} giây trước`;
                      case "halfAMinute":
                        return "30 giây trước";
                      case "lessThanXMinutes":
                        return `${count} phút trước`;
                      case "xMinutes":
                        return `${count} phút trước`;
                      case "aboutXHours":
                        return `${count} giờ trước`;
                      case "xHours":
                        return `${count} giờ trước`;
                      case "xDays":
                        return `${count} ngày trước`;
                      case "aboutXMonths":
                        return `${count} tháng trước`;
                      case "xMonths":
                        return `${count} tháng trước`;
                      case "aboutXYears":
                        return `${count} năm trước`;
                      case "xYears":
                        return `${count} năm trước`;
                      default:
                        return "";
                    }
                  },
                },
                includeSeconds: true,
              })}
            </span>
          </div>
        </div>
        <div className="more-options">
          <FiMoreHorizontal size={20} className="more-icon" />
          <FiX size={20} className="close-icon" onClick={onClose} />
        </div>
      </div>

      <span className="post-content">{posts.content}</span>

      <div className="actions">
        {/* Nút Like */}
        <button
          className={`action-btn ${posts.hasLiked ? "liked" : ""}`}
          onClick={() => handleLikePost(posts.id)}
          disabled={posts.isLiking}
        >
          {posts.hasLiked ? (
            <FaHeart size={18} className="like-icon" />
          ) : (
            <FiHeart size={18} className="like-icon" />
          )}
          <span className="action-count">{posts.likeCount}</span>
        </button>

        {/* Nút Comment */}
        <button className="action-btn">
          <FiMessageSquare size={18} className="comment-icon" />
          <span className="action-count">{posts.commentCount}</span>
        </button>

        {/* Nút Share */}
        <button
          className="action-btn"
          onClick={() => dispatch(openShareModal(posts))}
        >
          <FiShare2 size={18} className="share-icon" />
          <span className="action-count">{posts.shareCount}</span>
        </button>
      </div>
    </div>
  );
};

export default ContentPostComment;
