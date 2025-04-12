import React, { useEffect, useRef, useCallback } from "react";
import avatarDefaut from "../assets/AvatarDefault.png";
import "../styles/SettingModal.scss";
const SettingModal = ({ isOpen, onClose, users, UserProfile, logout }) => {
  const modalRef = useRef(null);

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  if (!isOpen) return null;

  return (
    <div className="setting-Overlay" ref={modalRef}>
      <div className="Account" onClick={UserProfile}>
        <img
          className="AvatarUser"
          src={users.profilePicture || avatarDefaut}
          alt="Avatar"
        />
        <span className="UserName">
          {users.fullName || "University Sharing"}
        </span>
      </div>
      <div className="setting">
        <span className="btn-changeProfile">Sửa thông tin cá nhân</span>
        <span className="btn-yourScore">Điểm uy tín</span>
        <span className="btn-logout" onClick={logout}>
          Đăng xuất
        </span>
      </div>
    </div>
  );
};

export default SettingModal;
