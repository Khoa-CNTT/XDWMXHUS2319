import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Thêm để điều hướng
import { useAuth } from "../../contexts/AuthContext"; // Tích hợp authContext
import { toast } from "react-toastify"; // Thêm toast
import avatarDefaut from "../../assets/AvatarDefault.png";
import "../styles/SettingModalAdmin.scss";

const SettingModal = ({ isOpen, onClose, UserProfile, users }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate(); // Thêm navigate
  const { logout } = useAuth(); // Lấy logout từ context

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose]
  );
  const handleSetting = () => {
    navigate("/settings");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleLogout = () => {
    logout(); // Gọi logout từ authContext
    toast.success("Đăng xuất thành công!");
    navigate("/login"); // Điều hướng về trang đăng nhập
    onClose(); // Đóng modal
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="setting-modal-background"></div>
      <div className="setting-Overlay-admin" ref={modalRef}>
        <div
          className="Account"
          onClick={UserProfile}
          style={{ color: "black" }}
        >
          <img
            className="AvatarUser"
            src={users?.profilePicture || avatarDefaut}
            alt="Avatar"
          />
          <span className="UserName">
            {users?.fullName || "University Sharing"}
          </span>
        </div>
        <div
          className="setting"
          style={{ color: "black", "line-height": "unset" }}
        >
          <span className="btn-changeProfile" onClick={handleSetting}>
            Cài đặt
          </span>
          {/* <span className="btn-yourScore">Điểm uy tín</span> */}
          <span className="btn-logout" onClick={logout}>
            Đăng xuất
          </span>
        </div>
      </div>
    </>
  );
};

export default SettingModal;
