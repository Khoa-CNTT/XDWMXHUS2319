import React from "react";
import "../../styles/ProfileUserView/ProfileHeader.scss";

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="profile-header__background">
        <img
          src="https://cdn.tgdd.vn/Files/2016/09/22/890600/1111.jpg"
          alt="Background"
          className="profile-header__background-image"
        />
      </div>
      <div className="profile-header__container">
        <div className="profile-header__info">
          <img
            src="https://i.pinimg.com/originals/4a/7f/73/4a7f73035bb4743ee57c0e351b3c8bed.jpg"
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
    </div>
  );
};

export default ProfileHeader;
