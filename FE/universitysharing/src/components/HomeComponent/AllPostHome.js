import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/headerHome.scss";
import { fetchLikes } from "../../stores/action/likeAction";
import { fetchShares } from "../../stores/action/shareAction";
import {
  FiMoreHorizontal,
  FiX,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import avatarWeb from "../../assets/AvatarDefault.png";
import CommentModal from "../CommentModal";
import ShareModal from "../shareModal";
import SharedPost from "./SharingPost";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  likePost,
  deletePost,
  fetchPostsByOwner,
} from "../../stores/action/listPostActions";
import {
  hidePost,
  openCommentModal,
  closeCommentModal,
  openShareModal,
  closeShareModal,
  openPostOptionModal,
  closePostOptionModal,
  openInteractorModal,
  closeInteractorModal,
  openInteractorShareModal,
  closeInteractorShareModal,
} from "../../stores/reducers/listPostReducers";
import { debounce } from "lodash";
import PostOptionsModal from "./PostOptionModal";
import getUserIdFromToken from "../../utils/JwtDecode";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLocation, useNavigate } from "react-router-dom";
import InteractorModal from "../InteractorModal";
import Spinner from "../../utils/Spinner";
import InteractorShareModal from "../InteractorShareModal";

const AllPosts = ({ usersProfile, showOwnerPosts = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const postsEndRef = useRef(null);

  const {
    posts,
    hasMoreAllPosts,
    hasMoreOwnerPosts,
    selectedPost,
    isShareModalOpen,
    selectedPostToShare,
    selectedPostToOption,
    isPostOptionsOpen,
    isInteractorModalOpen,
    isInteractorShareModalOpen,
    selectedPostForInteractions,
    loading,
    loadingCreatePost,
    postLikes,
    likesLoading,
    likesError,
    postShares,
    sharesLoading,
    sharesError,
  } = useSelector((state) => state.posts);

  const hasMorePosts = showOwnerPosts ? hasMoreOwnerPosts : hasMoreAllPosts;
  const [lastPostId, setLastPostId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLastPostId(null);
    if (showOwnerPosts) {
      dispatch(fetchPostsByOwner());
    } else {
      dispatch(fetchPosts());
    }
  }, [dispatch, showOwnerPosts]);

  useEffect(() => {
    if (posts.length > 0) {
      setLastPostId(posts[posts.length - 1].id);
    }
  }, [posts]);

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMorePosts || !lastPostId) return;
    setLoadingMore(true);
    const fetchAction = showOwnerPosts ? fetchPostsByOwner : fetchPosts;
    dispatch(fetchAction(lastPostId))
      .unwrap()
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [dispatch, lastPostId, loadingMore, showOwnerPosts, hasMorePosts]);

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

  const userId = getUserIdFromToken();

  const handleOpenCommentModal = (post, index) => {
    dispatch(openCommentModal({ ...post, initialMediaIndex: index }));
    navigate(`/post/${post.id}`);
  };

  const handleCloseCommentModal = () => {
    dispatch(closeCommentModal());
    navigate(-1);
  };

  const handleOpenPostOptions = (event, post) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    dispatch(
      openPostOptionModal({
        post,
        position: { top: rect.bottom + 5, left: rect.left - 120 },
      })
    );
  };

  const handleDeletePost = debounce((postId) => {
    dispatch(deletePost(postId));
  }, 300);

  const confirmDelete = (postId) => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bài viết này không?",
      buttons: [
        { label: "Có", onClick: () => handleDeletePost(postId) },
        { label: "Không", onClick: () => console.log("Hủy xóa") },
      ],
    });
  };

  const handleLikePost = (postId) => {
    dispatch(likePost(postId));
  };

  const handleOpenInteractorModal = async (post) => {
    if (!postLikes[post.id]) {
      await dispatch(fetchLikes({ postId: post.id }));
    }
    dispatch(openInteractorModal(post));
  };

  const handleCloseInteractorModal = () => {
    dispatch(closeInteractorModal());
  };

  const handleOpenInteractorShareModal = async (post) => {
    if (!postShares[post.id]) {
      await dispatch(fetchShares({ postId: post.id }));
    }
    dispatch(openInteractorShareModal(post));
  };

  const handleCloseInteractorShareModal = () => {
    dispatch(closeInteractorShareModal());
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
              <div className="media-overlay" onClick={() => handleOpenCommentModal(post, index)}>+{totalMedia - (hasVideo ? 1 : 2)}</div>

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
    <div className="all-posts">
      {/* {loadingCreatePost && (
        <div className="loading-overlay">
          <Spinner size={70} />
        </div>
      )} */}

      {Array.isArray(posts) && posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="header-post">
                <div className="AvaName">
                  <img
                    className="avtardefaut"
                    src={post.profilePicture || avatarWeb}
                    alt="Avatar"
                  />
                  <div className="user-info">
                    <strong>{post.fullName}</strong>
                    <span className="timePost">
                      <FiClock size={12} style={{ marginRight: 4 }} />
                      {formatDistanceToNow(convertUTCToVNTime(post.createdAt), {
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
                <div className="post-actions">
                  <FiMoreHorizontal
                    className="btn-edit"
                    size={20}
                    onClick={(event) => handleOpenPostOptions(event, post)}
                  />
                  <FiX
                    className="btn-close"
                    size={20}
                    onClick={() => dispatch(hidePost(post.id))}
                  />
                </div>
              </div>

              <div className="content-posts">{post.content}</div>

              {!post.isSharedPost && <p></p>}

              {post.isSharedPost && (
                <div className="Share-Post-origigin">
                  <SharedPost post={post} />
                </div>
              )}

              {renderMediaItems(post)}

              <div className="post-actions-summary">
                <div
                  className="reactions"
                  onClick={() => handleOpenInteractorModal(post)}
                  style={{ cursor: "pointer" }}
                >
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
                  <span
                    onClick={() => handleOpenInteractorShareModal(post)}
                    style={{ cursor: "pointer" }}
                  >
                    {post.shareCount} lượt chia sẻ
                  </span>
                </div>
              </div>

              <div className="actions">
                <button
                  className={`action-btn ${post.hasLiked ? "liked" : ""}`}
                  onClick={() => handleLikePost(post.id)}
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
                  onClick={() => dispatch(openShareModal(post))}
                >
                  <FiShare2 className="share-icon" size={18} />
                  <span className="action-count">Chia sẻ</span>
                </button>
              </div>
            </div>
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

      {isPostOptionsOpen && selectedPostToOption && (
        <PostOptionsModal
          isOwner={userId === selectedPostToOption.post.userId}
          onClose={() => dispatch(closePostOptionModal())}
          position={selectedPostToOption.position}
          postId={selectedPostToOption.post.id}
          handleDeletePost={confirmDelete}
          post={selectedPostToOption.post}
        />
      )}

      {selectedPost && location.pathname.includes(`/post/${selectedPost.id}`) && (
        <CommentModal
          post={selectedPost}
          onClose={handleCloseCommentModal}
          usersProfile={usersProfile}
        />
      )}

      {selectedPostToShare && (
        <ShareModal
          post={selectedPostToShare}
          isOpen={isShareModalOpen}
          onClose={() => dispatch(closeShareModal())}
          usersProfile={usersProfile}
        />
      )}

      {isInteractorModalOpen && selectedPostForInteractions && (
        <InteractorModal
          isOpen={isInteractorModalOpen}
          onClose={handleCloseInteractorModal}
          likesData={postLikes[selectedPostForInteractions.id]}
          isLoading={likesLoading}
          error={likesError}
          postId={selectedPostForInteractions.id}
        />
      )}

      {isInteractorShareModalOpen && selectedPostForInteractions && (
        <InteractorShareModal
          isOpen={isInteractorShareModalOpen}
          onClose={handleCloseInteractorShareModal}
          sharesData={postShares[selectedPostForInteractions.id]}
          isLoading={sharesLoading}
          error={sharesError}
          postId={selectedPostForInteractions.id}
        />
      )}
    </div>
  );
};



export default AllPosts;