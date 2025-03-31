import React, { useState, useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPosts,
  likePost,
  deletePost,
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
const AllPosts = ({ usersProfile }) => {
  const dispatch = useDispatch();
  //lấy các trạng thái khai báo từ Redux
  const {
    posts,
    selectedPost,
    isShareModalOpen,
    selectedPostToShare,
    selectedPostToOption,
    isPostOptionsOpen,
  } = useSelector((state) => state.posts);
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const navigate = useNavigate();
  const location = useLocation();

  // Mở modal và cập nhật URL
  const handleOpenCommentModal = (post) => {
    dispatch(openCommentModal(post));
    navigate(`/post/${post.id}`); // Cập nhật URL
  };

  // Đóng modal và quay lại trang trước
  const handleCloseCommentModal = () => {
    dispatch(closeCommentModal());
    navigate("/home");
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
      {Array.isArray(posts) && posts.length > 0 ? (
        posts.map((post) => (
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
            <p></p>
            {/* <div
              className="postImg"
              onClick={() => handleOpenCommentModal(post)}
            >
              <img src={post.imageUrl || imagePost} alt="Post" />
            </div> */}

            {/* Đoạn này cho video lần hình ảnh xuất hiện  */}
            {/* <div
              className={`media-container ${
                post.imageUrl && post.videoUrl ? "has-both" : ""
              }`}
            >
              {post.imageUrl && (
                <div
                  className="postImg"
                  onClick={() => handleOpenCommentModal(post)}
                >
                  <img src={post.imageUrl || imagePost} alt="Post" />
                </div>
              )}

              {post.videoUrl && (
                <div className="postVideo">
                  <video controls>
                    <source src={post.videoUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </div>
              )}
            </div> */}

            <div
              className={`media-container ${
                post.imageUrl && post.videoUrl ? "has-both" : ""
              }`}
            >
              {post.imageUrl && (
                <div className="postImg">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    onClick={() => handleOpenCommentModal(post)}
                  />
                </div>
              )}

              {post.videoUrl && (
                <div className="postVideo">
                  <video controls>
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
        ))
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
