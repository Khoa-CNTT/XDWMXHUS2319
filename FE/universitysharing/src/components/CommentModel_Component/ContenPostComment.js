import React from "react";
import "../../styles/CommentOverlay.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import { useDispatch, useSelector } from "react-redux";
import { likePost } from "../../stores/action/listPostActions";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt
import { fetchLikes } from "../../stores/action/likeAction";
import { fetchShares } from "../../stores/action/shareAction";
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
  openInteractorModal,
  openInteractorShareModal,
} from "../../stores/reducers/listPostReducers";
import { FaHeart } from "react-icons/fa"; // Icon trái tim đầy cho trạng thái đã like

const ContentPostComment = ({ post, onClose }) => {
  const dispatch = useDispatch();

  const posts = useSelector((state) =>
    state.posts.posts.find((p) => p.id === post.id)
  );
  console.log("Bài viết được chọn>>", post);
  // Like bài viết: bỏ debounce, dispatch trực tiếp
  const handleLikePost = (postId) => {
    dispatch(likePost(postId));
  };

  const { postLikes, postShares } = useSelector((state) => state.posts);
  // Open Likes Modal (InteractorModal)
  const handleOpenInteractorModal = async (post) => {
    if (!postLikes[post.id]) {
      await dispatch(fetchLikes({ postId: post.id }));
    }
    dispatch(openInteractorModal(post));
  };

  // Open Shares Modal (InteractorShareModal)
  const handleOpenInteractorShareModal = async (post) => {
    if (!postShares[post.id]) {
      await dispatch(fetchShares({ postId: post.id }));
    }
    dispatch(openInteractorShareModal(post));
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

      {/* Post Actions Summary */}
      <div className="post-actions-summary">
        <div
          className="reactions"
          onClick={() => handleOpenInteractorModal(posts)}
          style={{ cursor: "pointer" }}
        >
          <FaHeart className="like-icon" size={16} />
          <span>{posts.likeCount}</span>
        </div>
        <div className="comments-shares">
          <span>{posts.commentCount} bình luận</span>
          <span
            onClick={() => handleOpenInteractorShareModal(posts)}
            style={{ cursor: "pointer" }}
          >
            {typeof posts.shareCount === "number"
              ? posts.shareCount
              : posts.shareCount?.shareCount || 0}{" "}
            lượt chia sẻ
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button
          className={`action-btn ${posts.hasLiked ? "liked" : ""}`}
          onClick={() => handleLikePost(posts.id)}
          disabled={posts.isLiking}
        >
          {posts.hasLiked ? (
            <FaHeart className="like-icon" size={18} />
          ) : (
            <FiHeart className="like-icon" size={18} />
          )}
          <span className="action-count">Thích</span>
        </button>

        <button className="action-btn">
          <FiMessageSquare className="comment-icon" size={18} />
          <span className="action-count">Bình luận</span>
        </button>

        <button
          className="action-btn"
          onClick={() => dispatch(openShareModal(posts))}
        >
          <FiShare2 className="share-icon" size={18} />
          <span className="action-count">Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};
export default ContentPostComment;
