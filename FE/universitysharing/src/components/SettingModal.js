import React, { useEffect, useRef, useCallback } from "react";
import avatarDefaut from "../assets/AvatarDefault.png";
import "../styles/SettingModal.scss";
const SettingModal = ({ isOpen, onClose }) => {
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
      <div className="Account">
        <img className="AvatarUser" src={avatarDefaut} alt="Avatar" />
        <span className="UserName">Nguyễn Thành Chè</span>
      </div>
      <div className="setting">
        <span className="btn-changeProfile">Sửa thông tin cá nhân</span>
        <span className="btn-yourScore">Điểm uy tín</span>
        <span className="btn-logout">Đăng xuất</span>
      </div>
    </div>
  );
};

export default SettingModal;
