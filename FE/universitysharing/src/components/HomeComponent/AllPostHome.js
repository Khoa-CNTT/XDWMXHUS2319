import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/headerHome.scss";

import { 
  FiMoreHorizontal, 
  FiX, 
  FiHeart, 
  FiMessageSquare, 
  FiShare2,
  FiClock,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import avatarWeb from "../../assets/AvatarDefault.png";
import CommentModal from "../CommentModal";
import imagePost from "../../assets/ImgDefault.png";
import ShareModal from "../shareModal";
import SharedPost from "./SharingPost";
import logoWeb from "../../assets/Logo.png";

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
} from "../../stores/reducers/listPostReducers";
import { debounce } from "lodash";
import PostOptionsModal from "./PostOptionModal";
import getUserIdFromToken from "../../utils/JwtDecode";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Tiếng Việt
import { useLocation, useNavigate } from "react-router-dom"; //Chuyển hướng trang
import Spinner from "../../utils/Spinner";

const AllPosts = ({ usersProfile, showOwnerPosts = false }) => {
  const dispatch = useDispatch();
  const [lastPostId, setLastPostId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const postsEndRef = useRef(null);
  //lấy các trạng thái khai báo từ Redux
  const {
    posts,
    hasMoreAllPosts, // Add this to your selector
    hasMoreOwnerPosts,
    selectedPost,
    isShareModalOpen,
    selectedPostToShare,
    selectedPostToOption,
    isPostOptionsOpen,
  } = useSelector((state) => state.posts);
  const hasMorePosts = showOwnerPosts ? hasMoreOwnerPosts : hasMoreAllPosts;
  useEffect(() => {
    // Reset state when switching between all posts and owner posts
    setLastPostId(null);
    if (showOwnerPosts) {
      dispatch(fetchPostsByOwner());
    } else {
      dispatch(fetchPosts());
    }
  }, [dispatch, showOwnerPosts]);

  const loading = useSelector((state) => state.posts.loading);
  const loadingCreatePost = useSelector(
    (state) => state.posts.loadingCreatePost
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Function to load more posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMorePosts || !lastPostId) return;

    setLoadingMore(true);
    const fetchAction = showOwnerPosts ? fetchPostsByOwner : fetchPosts;
    dispatch(fetchAction(lastPostId))
      .unwrap() // Use unwrap() to properly handle promises
      .catch(() => {
        // Handle error if needed
      })
      .finally(() => setLoadingMore(false));
  }, [dispatch, lastPostId, loadingMore, showOwnerPosts, hasMorePosts]);

  // Update lastPostId when posts change
  useEffect(() => {
    if (posts.length > 0) {
      setLastPostId(posts[posts.length - 1].id);
    }
  }, [posts]);

  // Cuộn scroll tới bài cuối sẽ load thêm
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (postsEndRef.current) {
      observer.observe(postsEndRef.current);
    }

    return () => {
      if (postsEndRef.current) {
        observer.unobserve(postsEndRef.current);
      }
    };
  }, [loadMorePosts]);

  // Mở modal và cập nhật URL
  const handleOpenCommentModal = (post) => {
    dispatch(openCommentModal(post));
    navigate(`/post/${post.id}`); // Cập nhật URL
  };

  // Đóng modal và quay lại trang trước
  const handleCloseCommentModal = () => {
    dispatch(closeCommentModal());
    navigate(-1);
  };

  //Mở modal option
  const userId = getUserIdFromToken(); // Lấy userId từ token
  const handleOpenPostOptions = (event, post) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    dispatch(
      openPostOptionModal({
        post,
        position: { top: rect.bottom + 5, left: rect.left - 120 }, // Điều chỉnh vị trí
      })
    );
  };

  //Xóa bài viết
  const handleDeletePost = debounce((postId) => {
    dispatch(deletePost(postId)); // Truyền trực tiếp ID (string)
  }, 300);
  // Hiển thị confirm trước khi xóa
  const confirmDelete = (postId) => {
    confirmAlert({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bài viết này không?",
      buttons: [
        {
          label: "Có",
          onClick: () => handleDeletePost(postId),
        },
        {
          label: "Không",
          onClick: () => console.log("Hủy xóa"),
        },
      ],
    });
  };

  //Like bài viết
// Like bài viết
// Like bài viết
const handleLikePost = (postId) => {
  dispatch(likePost(postId)); // Dispatch action ngay lập tức, không delay
};
// Hàm chuyển đổi UTC sang giờ Việt Nam (UTC+7)
const convertUTCToVNTime = (utcDate) => {
  const date = new Date(utcDate);
  // Thêm 7 giờ để chuyển từ UTC sang giờ Việt Nam
  date.setHours(date.getHours() + 7);
  return date;
};
  return (
    <div className="all-posts">
      {loadingCreatePost && (
        <div className="loading-overlay">
          <Spinner size={70} />
        </div>
      )}
      
      {Array.isArray(posts) && posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <div className="post" key={post.id}>
              {/* Header Post */}
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
          case 'lessThanXSeconds': return 'vài giây trước';
          case 'xSeconds': return `${count} giây trước`;
          case 'halfAMinute': return '30 giây trước';
          case 'lessThanXMinutes': return `${count} phút trước`;
          case 'xMinutes': return `${count} phút trước`;
          case 'aboutXHours': return `${count} giờ trước`;
          case 'xHours': return `${count} giờ trước`;
          case 'xDays': return `${count} ngày trước`;
          case 'aboutXMonths': return `${count} tháng trước`;
          case 'xMonths': return `${count} tháng trước`;
          case 'aboutXYears': return `${count} năm trước`;
          case 'xYears': return `${count} năm trước`;
          default: return '';
        }
      }
    },
    includeSeconds: true
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
  
              {/* Post content */}
              <div className="content-posts">{post.content}</div>
  
              {post.isSharedPost && (
                <div className="Share-Post-origigin">
                  <SharedPost post={post} />
                </div>
              )}
  
              <div className={`media-container ${post.imageUrl && post.videoUrl ? "has-both" : ""}`}>
                {post.imageUrl && (
                  <div className="post-media">
                    <img
                      src={post.imageUrl || avatarWeb}
                      alt="Post"
                      onClick={() => handleOpenCommentModal(post)}
                    />
                  </div>
                )}
  
                {post.videoUrl && (
                  <div className="post-media">
                    <video
                      controls
                      onClick={() => handleOpenCommentModal(post)}
                    >
                      <source src={post.videoUrl} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                )}
              </div>
  
              {/* Actions */}
              <div className="actions">
  <button 
    className={`action-btn ${post.hasLiked ? 'liked' : ''}`}
    onClick={() => handleLikePost(post.id)}
    disabled={post.isLiking}
  >
    {post.hasLiked ? (
      <FaHeart className="like-icon" size={18} />
    ) : (
      <FiHeart className="like-icon" size={18} />
    )}
    <span className="action-count">{post.likeCount}</span>
  </button>
  
  <button 
    className="action-btn"
    onClick={() => handleOpenCommentModal(post)}
  >
    <FiMessageSquare className="comment-icon" size={18} />
    <span className="action-count">{post.commentCount}</span>
  </button>
  
  <button 
    className="action-btn"
    onClick={() => dispatch(openShareModal(post))}
  >
    <FiShare2 className="share-icon" size={18} />
    <span className="action-count">{post.shareCount}</span>
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
  
      {/* Modals remain the same */}
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
    </div>
  );
};

export default AllPosts;
