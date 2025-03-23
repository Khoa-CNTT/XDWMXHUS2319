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
import axios from "axios";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("https://localhost:7053/api/Post/getallpost?pageSize=10", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPosts(response.data.data.posts || []);
        console.log("API Về: ", response);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy bài viết:", error);
      });
  }, []);
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
                  onClick={() => handleDelete(post.id)}
                />
              </p>
            </div>

            {/* Nội dung bài viết */}
            <span className="content-posts">{post.content}</span>
            <p></p>
            <div className="postImg" onClick={() => openCommentModal(post)}>
              <img src={post.imageUrl || imagePost} alt="Post" />
            </div>

            {/* Actions */}
            <div className="actions">
              <span onClick={() => handleLike(post.id)}>
                {/* <img src={post.isLiked ? likeFill : likeIcon} alt="Like" /> */}
                <img src={likeIcon} alt="Like" />
                <span>{post.likeCount}</span>
              </span>
              <span onClick={() => openCommentModal(post)}>
                <img src={commentIcon} alt="Comment" />
                <span>{post.commentCount}</span>
              </span>
              <span onClick={() => openShareModal(post)}>
                <img src={shareIcon} alt="Share" />
                <span>{post.shareCount}</span>
              </span>
            </div>
          </div>
        ))
      ) : (
        <p>Không có bài viết nào.</p>
      )}

      {selectedPost && (
        <CommentModal post={selectedPost.id} onClose={closeCommentModal} />
      )}
      {selectedPostToShare && (
        <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />
      )}
    </div>
  );
};

export default AllPosts;
