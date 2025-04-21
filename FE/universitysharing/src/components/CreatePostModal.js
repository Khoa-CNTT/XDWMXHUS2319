import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import avatarDeafault from "../assets/AvatarDefault.png";
import closeIcon from "../assets/iconweb/closeIcon.svg";
import imageIcon from "../assets/iconweb/imageIcon.svg";
import videoIcon from "../assets/iconweb/videoIcon.svg";
import "../styles/CreatePostModal.scss";
import "animate.css";

import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../stores/action/listPostActions";
import Spinner from "../utils/Spinner";

const CreatePostModal = ({ isOpen, onClose, usersProfile }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState(4);
  const [scope, setScope] = useState(0);
  const loading = useSelector((state) => state.posts.loading);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
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

    setMediaFiles((prev) => {
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
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung bài viết!");
      return;
    }
  
    const formData = new FormData();
    formData.append("Content", content);
    formData.append("PostType", postType);
    formData.append("Scope", scope);
  
    if (mediaFiles.length > 0) {
      const videoFile = mediaFiles.find((media) => media.type === "video");
      const imageFiles = mediaFiles.filter((media) => media.type === "image");
  
      if (videoFile) {
        formData.append("Video", videoFile.file);
      }
  
      imageFiles.forEach((image) => {
        formData.append("Images", image.file); // 👈 quan trọng: sửa thành "Images"
        console.log("hehehe",image.file);
      });
    }
  
    dispatch(
      createPost({
        formData,
        fullName: usersProfile.fullName || "University Sharing",
        profilePicture: usersProfile.profilePicture || avatarDeafault,
      })
    );
  
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="create-post-overlay" onClick={onClose}></div>
      <div className="create-post-modal">
        <div className="header-post-modal">
          <span>Đăng bài</span>
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="close-icon"
          />
        </div>
        {/* Rest of your JSX remains the same */}
        <div className="user-create-post">
          <img
            src={usersProfile.profilePicture || avatarDeafault}
            alt="Avatar"
          />
          <span className="userName-share">
            {usersProfile.fullName || "University Sharing"}
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
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>
        <div className="type-status-post">
          <select
            className="status-post"
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
          >
            <option value="0">Công khai</option>
            <option value="1">Riêng tư</option>
            <option value="2">Chỉ bạn bè</option>
          </select>
          <select
            className="type-post"
            value={postType}
            onChange={(e) => setPostType(Number(e.target.value))}
          >
            <option value="4">Thảo luận</option>
            <option value="5">Tư liệu học tập</option>{" "}
            {/* Sửa value để khác nhau */}
            <option value="6">Trao đổi</option> {/* Sửa value để khác nhau */}
          </select>
        </div>
        <button
          className="btn-create-post"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Spinner size={20} color="#fff" /> : "Đăng bài"}
        </button>
      </div>
    </>,
    document.body // Render trực tiếp vào body
  );
};

export default CreatePostModal;
