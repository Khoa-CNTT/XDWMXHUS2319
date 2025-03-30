import React from "react";
import "../../styles/ProfileUserView/ProfileHeader.scss";

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="profile-header__background">
        <img
          src="https://via.placeholder.com/1200x300/1a2a44/ffffff?text=Starry+Sky"
          alt="Background"
          className="profile-header__background-image"
        />
      </div>
      <div className="profile-header__info">
        <img
          src="https://via.placeholder.com/100"
          alt="Avatar"
          className="profile-header__avatar"
        />
        <div className="profile-header__details">
          <h1 className="profile-header__name">Bé Múp Trạc</h1>
          <p className="profile-header__stats">50 bạn bè </p>
          <span className="profile-header__trust">Điểm uy tín: 100</span>
        </div>
        <a href="#" className="profile-header__edit-link">
          Chỉnh sửa trang cá nhân
        </a>
      </div>
    </div>
  );
};

export default ProfileHeader;
