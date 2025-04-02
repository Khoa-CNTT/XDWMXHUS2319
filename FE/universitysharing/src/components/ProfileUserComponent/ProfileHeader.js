import React from "react";
import EditProfileModal from "../components/ProfileUserComponent/EditProfileModal";
import "../../styles/ProfileUserView/ProfileHeader.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import logoWeb from "../../assets/Logo.png";

const ProfileHeader = ({ usersProfile }) => {
  return (
    <div className="profile-header">
      <div className="profile-header__background">
        <img
          src={logoWeb}
          alt="Background"
          className="profile-header__background-image"
        />
      </div>
      <div className="profile-header__container">
        <div className="profile-header__info">
          <img
            src={usersProfile?.profilePicture || avatarDefaut}
            alt="Avatar"
            className="profile-header__avatar"
          />
          <div className="profile-header__details">
            <h1 className="profile-header__name">
              {usersProfile?.fullName || "Chưa có thông tin."}
            </h1>
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
