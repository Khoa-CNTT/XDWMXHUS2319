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
import { fetchPosts, likePost } from "../../stores/action/listPostActions";
import {
  hidePost,
  openCommentModal,
  closeCommentModal,
  openShareModal,
  closeShareModal,
} from "../../stores/reducers/listPostReducers";

const AllPosts = () => {
  const dispatch = useDispatch();
  const { posts, selectedPost, isShareModalOpen, selectedPostToShare } =
    useSelector((state) => state.posts);
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);
  const isLoading = useSelector((state) => state.posts.loading); // Trạng thái loading
  if (isLoading) {
    return <span>Đang tải bài viết </span>;
  }
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
                <img className="btn-edit" src={moreIcon} alt="More" />
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
              <span onClick={() => dispatch(likePost(post.id))}>
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

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          post={selectedPost}
          isOpen={!selectedPost}
          onClose={() => dispatch(closeCommentModal())}
        />
      )}

      {/* Share Modal */}
      {selectedPostToShare && (
        <ShareModal
          post={selectedPostToShare}
          isOpen={isShareModalOpen}
          onClose={() => dispatch(closeShareModal())}
        />
      )}
    </div>
  );
};

export default AllPosts;
