import React, { useState, useEffect, useRef } from "react";
import avatarDeafault from "../assets/AvatarDefault.png";
import closeIcon from "../assets/iconweb/closeIcon.svg";
import imageIcon from "../assets/iconweb/imageIcon.svg";
import videoIcon from "../assets/iconweb/videoIcon.svg";
import "../styles/CreatePostModal.scss";
import "animate.css";

const CreatePostModal = ({ isOpen, onClose, usersProfile }) => {
  const [mediaFiles, setMediaFile] = useState([]);

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
    const file = event.target.files[0]; // Chỉ lấy file đầu tiên
    //Nếu muốn lấy nhiều ảnh và video thì // const files = Array.from(event.target.files);
    if (!file) return;

    const newMedia = {
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    };

    setMediaFile((prev) => {
      // Nếu là video, thay thế video cũ, nếu là ảnh, thay thế ảnh cũ
      const updatedMedia = prev.filter((media) => media.type !== newMedia.type);
      return [...updatedMedia, newMedia];
    });
  };
  const handleRemoveMedia = (index) => {
    setMediaFile((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="create-post-overlay animate__animated animate__fadeIn animate_faster"
        onClick={onClose}
      ></div>
      <div className="create-post-modal  animate__animated animate__fadeIn animate_faster">
        <div className="header-post-modal">
          <span>Đăng bài </span>
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="close-icon"
          />
        </div>
        <div className="user-create-post">
          <img
            src={usersProfile.profilePicture || avatarDeafault}
            alt="Avatar"
          />
          <span className="userName-share">
            {" "}
            {usersProfile.fullName || "University Sharing"}
          </span>
        </div>
        <textarea placeholder="Bạn đang nghĩ gì thế?"></textarea>

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
              multiple
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>
        <div className="type-status-post">
          <select className="status-post">
            <option value="0">Công khai</option>
            <option value="1">Riêng tư</option>
          </select>
          <select className="type-post">
            <option value="4">Thảo luận</option>
            <option value="4 ">Tư liệu học tập</option>
            <option value="4 ">Trao đổi</option>
          </select>
        </div>
        <button className="btn-create-post">Đăng bài</button>
      </div>
    </>
  );
};
export default CreatePostModal;
