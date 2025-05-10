import React, { useEffect, useRef } from "react";
import "../../styles/AllReport.scss";
import { FiHeart, FiMessageSquare, FiShare2, FiClock } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import avatarWeb from "../../../assets/AvatarDefault.png";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReportedPosts,
  fetchUserUserReports,
} from "../../../stores/action/adminActions";
import { openCommentModal } from "../../../stores/reducers/listPostReducers";
import getUserIdFromToken from "../../../utils/JwtDecode";
import "react-confirm-alert/src/react-confirm-alert.css";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocation, useNavigate } from "react-router-dom";
import AllReportFromUser from "./ReportFromUser";
import UserUserReport from "./UserUserReport";

const AllReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const postsEndRef = useRef(null);

  const { reportedPosts, userUserReports, loading, error } = useSelector(
    (state) => state.reportAdmintSlice
  );

  useEffect(() => {
    dispatch(fetchReportedPosts());
    dispatch(fetchUserUserReports());
  }, [dispatch]);

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  // Chuyển đổi ngày sang UTC+7
  const handleOpenCommentModal = (post, index = 0) => {
    dispatch(openCommentModal({ ...post, initialMediaIndex: index }));
    navigate(`/post/${post.id}`, { state: { background: location } });
  };

  const convertUTCToVNTime = (utcDate) => {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 7);
    return date;
  };

  const getMediaContainerClass = (post) => {
    const imageCount = post.imageUrl ? post.imageUrl.split(",").length : 0;
    const hasVideo = !!post.videoUrl;
    const totalMedia = imageCount + (hasVideo ? 1 : 0);

    let className = "media-container";
    switch (totalMedia) {
      case 1:
        className += hasVideo ? " single-video" : " single-image";
        break;
      case 2:
        className += " two-items";
        if (hasVideo) className += " has-video";
        break;
      default:
        if (totalMedia >= 3) {
          className += " multi-items";
          if (hasVideo) className += " has-video";
        }
    }
    return className;
  };

  const renderMediaItems = (post) => {
    const imageUrls = post.imageUrl ? post.imageUrl.split(",") : [];
    const hasVideo = !!post.videoUrl;
    const totalMedia = imageUrls.length + (hasVideo ? 1 : 0);

    if (totalMedia === 0) return null;

    return (
      <div className={getMediaContainerClass(post)}>
        {imageUrls.map((url, index) => {
          const fullUrl = url.startsWith("http")
            ? url.trim()
            : `https://localhost:7053${url.trim()}`;
          const showOverlay = totalMedia > 2 && index === (hasVideo ? 0 : 1);

          if (totalMedia > 2 && index > (hasVideo ? 0 : 1)) return null;
          if (hasVideo && index > 0) return null;

          return (
            <div className="media-item" key={index}>
              <img src={fullUrl} alt={`Post media ${index}`} />
              {showOverlay && (
                <div className="media-overlay">
                  +{totalMedia - (hasVideo ? 1 : 2)}
                </div>
              )}
            </div>
          );
        })}
        {hasVideo && (
          <div className="media-item video-item">
            <video controls>
              <source src={post.videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="all-posts-report">
      {error && <div className="error-message">{error.message || error}</div>}
      {Array.isArray(userUserReports) && userUserReports.length > 0 && (
        <UserUserReport reports={userUserReports} />
      )}
      {Array.isArray(reportedPosts) && reportedPosts.length > 0 ? (
        <>
          {reportedPosts.map((post) => (
            <div className="post-container" key={post.id}>
              <div className="post">
                <div className="header-post">
                  <div className="AvaName">
                    <img
                      className="avtardefaut"
                      src={post.profilePicture || avatarWeb}
                      alt="Avatar"
                    />
                    <div className="user-info">
                      <strong onClick={() => navigateUser(post.userId)}>
                        {post.fullName}
                      </strong>
                      <div className="status-time-post">
                        <span className="timePost">
                          <FiClock size={12} style={{ marginRight: 4 }} />
                          {formatDistanceToNow(
                            convertUTCToVNTime(post.createdAt),
                            {
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
                            }
                          )}
                        </span>
                        <span className="status-post">
                          {post.scope === 0 ? "Công khai" : "Riêng tư"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="post-actions"></div>
                </div>

                <div className="content-posts">{post.content}</div>

                {renderMediaItems(post)}

                <div className="post-actions-summary">
                  <div className="reactions" style={{ cursor: "pointer" }}>
                    <FaHeart className="like-icon" size={16} />
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="comments-shares">
                    <span style={{ cursor: "pointer" }}>
                      {post.commentCount} bình luận
                    </span>
                    <span style={{ cursor: "pointer" }}>
                      {post.shareCount} lượt chia sẻ
                    </span>
                  </div>
                </div>

                <div className="actions">
                  <button
                    className={`action-btn ${post.hasLiked ? "liked" : ""}`}
                    disabled={post.isLiking}
                  >
                    {post.hasLiked ? (
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
                  <button className="action-btn">
                    <FiShare2 className="share-icon" size={18} />
                    <span className="action-count">Chia sẻ</span>
                  </button>
                </div>
              </div>
              <AllReportFromUser reports={post.reports} postId={post.id} />
            </div>
          ))}
          <div ref={postsEndRef} className="load-more-indicator">
            {loading && <p>Đang tải thêm bài viết...</p>}
          </div>
        </>
      ) : (
        <div className="no-posts">
          <p>Không có bài viết nào.</p>
        </div>
      )}
    </div>
  );
};

export default AllReport;
