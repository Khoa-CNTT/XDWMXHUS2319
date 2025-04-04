import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/headerHome.scss";
import shareIcon from "../../assets/iconweb/shareIcon.svg";
import likeIcon from "../../assets/iconweb/likeIcon.svg";
import likeFill from "../../assets/iconweb/likefillIcon.svg";
import commentIcon from "../../assets/iconweb/commentIcon.svg";
import closeIcon from "../../assets/iconweb/closeIcon.svg";
import moreIcon from "../../assets/iconweb/moreIcon.svg";
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
  const handleLikePost = debounce((postId) => {
    dispatch(likePost(postId));
  }, 1000);

  return (
    <div className="all-posts">
      {loadingCreatePost && (
        <div className="loading-overlay">
          <Spinner size={70} />
        </div>
      )}
      {/* {loading ? (
        <div className="loading-overlay">
          <Spinner size={70} />
        </div>
      ) :  */}
      {Array.isArray(posts) && posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <div className="post" key={post.id}>
              {/* Header Post */}
              <div className="header-post">
                <p className="AvaName">
                  <img
                    className="avtardefaut"
                    src={post.profilePicture || avatarWeb}
                    alt="Avatar"
                  />
                  <strong>{post.fullName}</strong>
                  <span className="timePost">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </p>
                <p className="closemore">
                  <img
                    className="btn-edit"
                    src={moreIcon}
                    alt="More"
                    onClick={(event) => handleOpenPostOptions(event, post)}
                  />
                  <img
                    className="btn-close"
                    src={closeIcon}
                    alt="Close"
                    onClick={() => dispatch(hidePost(post.id))}
                  />
                </p>
              </div>

              {/* Nội dung bài viết */}
              <span className="content-posts">{post.content}</span>

              {!post.isSharedPost && <p></p>}

              {post.isSharedPost && (
                <div className="Share-Post-origigin">
                  <SharedPost post={post}></SharedPost>
                </div>
              )}

              <div
                className={`media-container ${
                  post.imageUrl && post.videoUrl ? "has-both" : ""
                }`}
              >
                {post.imageUrl && (
                  <div className="postImg">
                    <img
                      src={post.imageUrl || avatarWeb}
                      alt="Post"
                      onClick={() => handleOpenCommentModal(post)}
                    />
                  </div>
                )}

                {post.videoUrl && (
                  <div className="postVideo">
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
                <span onClick={() => handleLikePost(post.id)}>
                  <img src={post.hasLiked ? likeFill : likeIcon} alt="Like" />

                  <span>{post.likeCount}</span>
                </span>
                <span onClick={() => handleOpenCommentModal(post)}>
                  <img src={commentIcon} alt="Comment" />
                  <span>{post.commentCount}</span>
                </span>
                <span onClick={() => dispatch(openShareModal(post))}>
                  <img src={shareIcon} alt="Share" />
                  <span>{post.shareCount}</span>
                </span>
              </div>
            </div>
          ))}
          {/* Loading indicator and sentinel element */}
          <div ref={postsEndRef} style={{ height: "20px" }}>
            {loadingMore && <p>Đang tải thêm bài viết...</p>}
          </div>
        </>
      ) : (
        <p>Không có bài viết nào.</p>
      )}

      {/* Post Options Modal */}
      {isPostOptionsOpen && selectedPostToOption && (
        <PostOptionsModal
          isOwner={userId === selectedPostToOption.post.userId}
          onClose={() => dispatch(closePostOptionModal())}
          position={selectedPostToOption.position} // Truyền vị trí vào modal
          postId={selectedPostToOption.post.id}
          handleDeletePost={confirmDelete}
          post={selectedPostToOption.post}
        />
      )}

      {/* Comment Modal */}
      {selectedPost &&
        location.pathname.includes(`/post/${selectedPost.id}`) && (
          <CommentModal
            post={selectedPost}
            //isOpen={true}
            onClose={handleCloseCommentModal}
            usersProfile={usersProfile}
          />
        )}

      {/* Share Modal */}
      {selectedPostToShare &&
        (console.log("chia  se"),
        (
          <ShareModal
            post={selectedPostToShare}
            isOpen={isShareModalOpen}
            onClose={() => dispatch(closeShareModal())}
            usersProfile={usersProfile}
          />
        ))}
    </div>
  );
};

export default AllPosts;
