import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import avatarDefaut from "../assets/AvatarDefault.png";
import closeIcon from "../assets/iconweb/closeIcon.svg";
import "../styles/ShareModal.scss";
import "animate.css";
import { useDispatch } from "react-redux";
import { sharePost } from "../stores/action/listPostActions";

const ShareModal = ({ isOpen, onClose, usersProfile, post }) => {
  const [content, setContent] = useState("");
  const [isSharing, setIsSharing] = useState(false); // Trạng thái chia sẻ

  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSharePost = async () => {
    if (isSharing) return; // Nếu đang chia sẻ, không làm gì cả

    setIsSharing(true); // Đánh dấu đang xử lý
    try {
      await dispatch(
        sharePost({
          postId: post.id,
          content: content,
        })
      );
      onClose(); // Đóng modal sau khi chia sẻ thành công
    } catch (error) {
      console.error("Lỗi chia sẻ:", error);
    } finally {
      setIsSharing(false); // Cho phép chia sẻ lại (tuỳ mục đích bạn có thể bỏ)
    }
  };

  if (!isOpen) return null;

  const userProfileData = usersProfile || {
    profilePicture: avatarDefaut,
    fullName: "University Sharing",
  };

  return createPortal(
    <div className="share-Overlay animate__animated animate__fadeIn">
      <div className="share-Modal">
        <div className="head-Share-Modal">
          <span>Chia sẻ</span>
          <img
            src={closeIcon}
            alt="Close"
            onClick={onClose}
            className="close-icon"
          />
        </div>
        <div className="Avar-name-share">
          <img
            src={userProfileData.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <span className="userName-share">
            {userProfileData.fullName || "University Sharing"}
          </span>
        </div>

        <textarea
          className="share-input"
          placeholder="Viết gì đó cho bài viết này!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <button
          onClick={handleSharePost}
          className="btn-share"
          type="submit"
          disabled={isSharing} // Disable nút nếu đang chia sẻ
        >
          {isSharing ? "Đang chia sẻ..." : "Chia sẻ"}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
