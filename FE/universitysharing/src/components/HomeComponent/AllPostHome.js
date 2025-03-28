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
            <div
              className="postImg"
              onClick={() => dispatch(openCommentModal(post))}
            >
              <img src={post.imageUrl || imagePost} alt="Post" />
            </div>

            {/* Actions */}
            <div className="actions">
              <span onClick={() => handleLikePost(post.id)}>
                <img src={post.hasLiked ? likeFill : likeIcon} alt="Like" />

                <span>{post.likeCount}</span>
              </span>
              <span onClick={() => dispatch(openCommentModal(post))}>
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
          handleDeletePost={handleDeletePost}
        />
      )}

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          post={selectedPost}
          isOpen={true}
          onClose={() => dispatch(closeCommentModal())}
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
