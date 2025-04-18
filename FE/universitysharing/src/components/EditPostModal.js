import React, { useState, useEffect, useRef } from "react";
import avatarDeafault from "../assets/AvatarDefault.png";
import closeIcon from "../assets/iconweb/closeIcon.svg";
import imageIcon from "../assets/iconweb/imageIcon.svg";
import videoIcon from "../assets/iconweb/videoIcon.svg";
import "../styles/CreatePostModal.scss";
import "animate.css";

import { useDispatch, useSelector } from "react-redux";
import { createPost, updatePost } from "../stores/action/listPostActions"; // Import action từ Redux
import { set } from "nprogress";

const EditModal = ({ isOpen, postId, post, onClose }) => {
  console.log("Nội dung post >> ", post);
  const [mediaFiles, setMediaFile] = useState([]);
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState(4);
  const [scope, setScope] = useState(0);
  const loading = useSelector((state) => state.posts.loading); // Lấy trạng thái loading từ Redux

  console.log("Hello đây là modal sửa bài viết");

  //Đưa nội dung bài viết vào modal sửa bài viết
  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setPostType(post.postType || 4);
      setScope(post.scope || 0); // Quyền riêng tư

      setMediaFile(() => {
        const media = [];
        const baseUrl = "https://localhost:7053";

        // Tách nhiều ảnh từ chuỗi imageUrl
        if (typeof post.imageUrl === "string" && post.imageUrl.trim() !== "") {
          const imageUrls = post.imageUrl.split(",").map((url) => url.trim());

          imageUrls.forEach((url) => {
            if (url) {
              const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
              media.push({ url: fullUrl, type: "image" });
            }
          });
        }

        // Chỉ lấy 1 video nếu có
        if (post.videoUrl) {
          media.push({ url: post.videoUrl, type: "video" });
        }

        return media;
      });
    }
  }, [post]);

  //Đóng modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(); // Đóng modal khi nhấn ESC
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newMediaFiles = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      file: file,
    }));
    setMediaFile((prev) => {
      // Lấy danh sách ảnh hiện tại
      const currentImages = prev.filter((media) => media.type === "image");
      // Kiểm tra có video trong file mới upload không
      const hasNewVideo = newMediaFiles.some((media) => media.type === "video");
      // Lấy video mới (nếu có)
      const newVideo = newMediaFiles.find((media) => media.type === "video");
      // Lấy tất cả ảnh mới
      const newImages = newMediaFiles.filter((media) => media.type === "image");

      if (hasNewVideo) {
        // Nếu có video mới, thay thế video cũ (nếu có) và giữ lại các ảnh hiện tại
        return [...currentImages, newVideo];
      } else {
        // Nếu chỉ có ảnh mới, thêm vào danh sách ảnh hiện tại
        return [...currentImages, ...newImages];
      }
    });
  };
  const handleRemoveMedia = (index) => {
    setMediaFile((prev) => prev.filter((_, i) => i !== index));
  };

  // Sửa bài viết
  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung bài viết!");
      return;
    }

    const formData = new FormData();
    formData.append("PostId", postId);
    formData.append("Content", content);
    formData.append("Scope", scope);

    // Kiểm tra xem có video hoặc ảnh nào trong mediaFiles không
    const hasVideo = mediaFiles.some((media) => media.type === "video");
    const hasImage = mediaFiles.some((media) => media.type === "image");

    // Nếu không có video trong mediaFiles nhưng post ban đầu có video
    // thì cần gửi yêu cầu xóa video
    if (!hasVideo) {
      formData.append("IsDeleteVideo", true);
    }

    // Tương tự với ảnh
    if (!hasImage) {
      formData.append("IsDeleteImage", true);
    }

    if (mediaFiles.length > 0) {
      mediaFiles.forEach(({ file }) => {
        if (file && file.type) {
          if (file.type.startsWith("video")) {
            formData.append("Video", file);
          } else {
            formData.append("Image", file);
          }
        }
      });
    }
    console.log("lengMedia", mediaFiles);

    dispatch(
      updatePost({
        postId: postId,
        formData,
        fullName: post.fullName || "University Sharing",
        profilePicture: post.profilePicture || avatarDeafault,
        createdAt: post.createdAt,
      })
    );

    onClose(); // Đóng modal sau khi gửi bài
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="create-post-overlay "
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
          onClose();
        }}
      ></div>
      <div className="create-post-modal  ">
        <div className="header-post-modal">
          <span>Sửa bài đăng </span>
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="close-icon"
          />
        </div>
        <div className="user-create-post">
          <img src={post.profilePicture || avatarDeafault} alt="Avatar" />
          <span className="userName-share">
            {" "}
            {post.fullName || "University Sharing"}
          </span>
        </div>
        <textarea
          placeholder="Bạn đang nghĩ gì thế?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <div className="preview-imgae-or-video">
          {mediaFiles.map((media, index) => (
            <div key={index} className="media-preview">
              {media.type === "video" ? (
                <video src={media.url} controls />
              ) : (
                <img src={media.url} alt={`Preview ${index}`} />
              )}
              <button
                className="remove-media"
                onClick={() => handleRemoveMedia(index)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
        {!post.isSharedPost && (
          <div className="option-create">
            <label>
              <img className="image-post" src={imageIcon} alt="Upload Image" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                hidden
              />
            </label>
            <label>
              <img className="video-post" src={videoIcon} alt="Upload Video" />
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleFileChange}
                hidden
              />
            </label>
          </div>
        )}
        <div className="type-status-post">
          <select
            className="status-post"
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
          >
            <option value="0">Công khai</option>
            <option value="1">Riêng tư</option>
          </select>
          <select
            className="type-post"
            value={postType}
            onChange={(e) => setPostType(Number(e.target.value))}
          >
            <option value="4">Thảo luận</option>
            <option value="4 ">Tư liệu học tập</option>
            <option value="4 ">Trao đổi</option>
          </select>
        </div>
        <button
          className="btn-create-post"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang đăng..." : "Sửa bài đăng"}
        </button>
      </div>
    </>
  );
};
export default EditModal;
