import React, { useState } from "react";
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
// import { Modal, Button } from "antd";
const AllPosts = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Nguyễn Thành Chè",
      avatarUser: avatarWeb,
      imgPost: imagePost,
      content: "Cảnh này thật quen thuộc ",
      likes: 2000,
      comments: 200,
      shares: 20,
      isLiked: false, // Trạng thái like/unlike
    },
    {
      id: 2,
      userName: "Nguyễn Thành Đảng",
      avatarUser: avatarWeb,
      imgPost:
        "https://wallpapers.com/images/featured/4k-nature-ztbad1qj8vdjqe0p.jpg",
      content: "Cảnh này thật quen thuộc",
      likes: 2000,
      comments: 200,
      shares: 20,
      isLiked: false, // Trạng thái like/unlike
    },
  ]);

  // Toggle Like
  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  // Xóa bài viết kiểu ẩn thôi
  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };
  //Đóng mở modal bình luận
  const [selectedPost, setSelectedPost] = useState(null);
  const openCommentModal = (post) => {
    setSelectedPost(post);
  };
  const closeCommentModal = () => {
    setSelectedPost(null);
  };

  // State để điều khiển mở/đóng modal chia sẻ
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState(null);

  // Mở modal chia sẻ
  const openShareModal = (post) => {
    setSelectedPostToShare(post);
    setIsShareModalOpen(true);
  };

  // Đóng modal chia sẻ
  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setSelectedPostToShare(null);
  };

  return (
    <div className="all-posts">
      {posts.map((post) => (
        <div className="post" key={post.id}>
          {/* Header Post */}
          <div className="header-post">
            <p className="AvaName">
              <img className="avtardefaut" src={post.avatarUser} alt="Avatar" />
              <strong>{post.userName}</strong>
            </p>
            <p className="closemore">
              <img className="btn-edit" src={moreIcon} alt="More" />
              <img
                className="btn-close"
                src={closeIcon}
                alt="Close"
                onClick={() => handleDelete(post.id)}
              />
            </p>
          </div>

          {/* Nội dung bài viết */}
          <span className="content-posts">{post.content}</span>
          <p></p>
          <div className="postImg" onClick={() => openCommentModal(post)}>
            <img src={post.imgPost} alt="Post" />
          </div>

          {/* Actions */}
          <div className="actions">
            <span onClick={() => handleLike(post.id)}>
              <img src={post.isLiked ? likeFill : likeIcon} alt="Like" />
              <span>{post.likes}</span>
            </span>
            <span onClick={() => openCommentModal(post)}>
              <img src={commentIcon} alt="Comment" />
              <span>{post.comments}</span>
            </span>
            <span onClick={() => openShareModal(post)}>
              <img src={shareIcon} alt="Share" />
              <span>{post.shares}</span>
            </span>
          </div>
        </div>
      ))}
      {selectedPost && (
        <CommentModal post={selectedPost} onClose={closeCommentModal} />
      )}
      {selectedPostToShare && (
        <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
      )}
    </div>
  );
};

export default AllPosts;
