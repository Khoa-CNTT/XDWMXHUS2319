import React, { useState, useEffect, useRef, useCallback } from "react";

import "../../styles/AllReport.scss";

import { FiHeart, FiMessageSquare, FiShare2, FiClock } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import avatarWeb from "../../../assets/AvatarDefault.png";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  fetchPostsByOwner,
  fetchPostsByOtherUser,
} from "../../../stores/action/listPostActions";
import { openCommentModal } from "../../../stores/reducers/listPostReducers";
import getUserIdFromToken from "../../../utils/JwtDecode";
import "react-confirm-alert/src/react-confirm-alert.css";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocation, useNavigate } from "react-router-dom";
import AllReportFromUser from "./ReportFromUser";

const AllReport = ({
  showOwnerPosts = false,
  isFriendProfile = false,
  userFriendId = null,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const postsEndRef = useRef(null);

  const { posts, hasMoreAllPosts, hasMoreOwnerPosts } = useSelector(
    (state) => state.posts
  );

  // console.log("Selection sercert box>>", selectedPost);

  const hasMorePosts = showOwnerPosts ? hasMoreOwnerPosts : hasMoreAllPosts;
  const [lastPostId, setLastPostId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLastPostId(null);

    if (showOwnerPosts) {
      if (isFriendProfile && userFriendId) {
        // Fetch posts for the specific friend's profile
        dispatch(fetchPostsByOtherUser({ userId: userFriendId })); // Pass as { userId }
      } else {
        dispatch(fetchPostsByOwner());
      }
    } else {
      dispatch(fetchPosts());
    }
  }, [dispatch, showOwnerPosts, isFriendProfile, userFriendId]);

  useEffect(() => {
    if (posts.length > 0) {
      setLastPostId(posts[posts.length - 1].id);
    }
  }, [posts]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMorePosts || !lastPostId) return;

    setLoadingMore(true);

    if (isFriendProfile && userFriendId) {
      // For friend's profile - use fetchPostsByOtherUser with userId and lastPostId
      dispatch(
        fetchPostsByOtherUser({
          userId: userFriendId,
          lastPostId: lastPostId,
        })
      )
        .unwrap()
        .catch(() => {})
        .finally(() => setLoadingMore(false));
    } else {
      // For own profile or home feed
      const fetchAction = showOwnerPosts ? fetchPostsByOwner : fetchPosts;
      dispatch(fetchAction(lastPostId))
        .unwrap()
        .catch(() => {})
        .finally(() => setLoadingMore(false));
    }
  }, [
    dispatch,
    lastPostId,
    loadingMore,
    hasMorePosts,
    showOwnerPosts,
    isFriendProfile,
    userFriendId,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );
    if (postsEndRef.current) observer.observe(postsEndRef.current);
    return () => {
      if (postsEndRef.current) observer.unobserve(postsEndRef.current);
    };
  }, [loadMorePosts]);

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  //mở comment modal
  const handleOpenCommentModal = (post, index = 0) => {
    dispatch(openCommentModal({ ...post, initialMediaIndex: index }));
    navigate(`/post/${post.id}`, { state: { background: location } });
  };

  //chuyển đổi ngày sang UTC +77
  const convertUTCToVNTime = (utcDate) => {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 7);
    return date;
  };

  //lấy thông hình ảnh và video set lên post nhiều hay 1 ảnh và 1 video
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

  // Trong AllPosts
  const renderMediaItems = (post) => {
    const imageUrls = post.imageUrl ? post.imageUrl.split(",") : [];
    const hasVideo = !!post.videoUrl;
    const totalMedia = imageUrls.length + (hasVideo ? 1 : 0);

    // Nếu không có ảnh lẫn video, không render media-container
    if (totalMedia === 0) return null;

    return (
      <div className={getMediaContainerClass(post)}>
        {imageUrls.map((url, index) => {
          const fullUrl = url.startsWith("http")
            ? url.trim()
            : `https://localhost:7053${url.trim()}`;
          // Hiển thị overlay trên ảnh thứ 2 nếu có > 2 media, hoặc trên ảnh đầu tiên nếu có video và > 1 ảnh
          const showOverlay = totalMedia > 2 && index === (hasVideo ? 0 : 1);

          // Hiển thị tối đa 1 ảnh nếu có video, hoặc 2 ảnh nếu không có video
          if (totalMedia > 2 && index > (hasVideo ? 0 : 1)) return null;
          if (hasVideo && index > 0) return null; // Chỉ hiển thị 1 ảnh nếu có video

          return (
            <div className="media-item" key={index}>
              <img
                src={fullUrl}
                alt={`Post media ${index}`}
                onClick={() => handleOpenCommentModal(post, index)}
              />
              {showOverlay && (
                <div
                  className="media-overlay"
                  onClick={() => handleOpenCommentModal(post, index)}
                >
                  +{totalMedia - (hasVideo ? 1 : 2)}
                </div>
              )}
            </div>
          );
        })}
        {hasVideo && (
          <div className="media-item video-item">
            <video
              controls
              onClick={() => handleOpenCommentModal(post, imageUrls.length)}
            >
              <source src={post.videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="all-posts-report">
      {Array.isArray(posts) && posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <>
              <div className="post-container">
                <div className="post" key={post.id}>
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
                            {" "}
                            {post.scope === 0 ? "Công khai" : "Riêng tư"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="post-actions"></div>
                  </div>

                  <div className="content-posts">{post.content}</div>

                  {!post.isSharedPost && <p></p>}

                  {post.isSharedPost && (
                    <div className="Share-Post-origigin"></div>
                  )}

                  {renderMediaItems(post)}

                  <div className="post-actions-summary">
                    <div className="reactions" style={{ cursor: "pointer" }}>
                      <FaHeart className="like-icon" size={16} />
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="comments-shares">
                      <span
                        onClick={() => handleOpenCommentModal(post, 0)}
                        style={{ cursor: "pointer" }}
                      >
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
                      // onClick={() => handleLikePost(post.id)}
                      disabled={post.isLiking}
                    >
                      {post.hasLiked ? (
                        <FaHeart className="like-icon" size={18} />
                      ) : (
                        <FiHeart className="like-icon" size={18} />
                      )}
                      <span className="action-count">Thích</span>
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleOpenCommentModal(post, 0)}
                    >
                      <FiMessageSquare className="comment-icon" size={18} />
                      <span className="action-count">Bình luận</span>
                    </button>
                    <button
                      className="action-btn"
                      // onClick={() => dispatch(openShareModal(post))}
                    >
                      <FiShare2 className="share-icon" size={18} />
                      <span className="action-count">Chia sẻ</span>
                    </button>
                  </div>
                </div>
                <AllReportFromUser />
              </div>
            </>
          ))}

          <div ref={postsEndRef} className="load-more-indicator">
            {loadingMore && <p>Đang tải thêm bài viết...</p>}
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
