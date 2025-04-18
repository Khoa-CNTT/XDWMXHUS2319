import React from "react";
import { useSelector } from "react-redux";
import "../../styles/ProfileUserView/ProfileIntro.scss";

const ProfileIntro = ({ onEditBioClick, isFriendProfile, usersProfile }) => {
  // Lấy trực tiếp từ store thay vì nhận qua props
  return (
    <div className="profile-intro">
      <div className="profile-intro__header">
        <h2>Giới Thiệu</h2>
        {!isFriendProfile && (
          <button
            className="profile-intro__edit-button"
            onClick={onEditBioClick}
          >
            Chỉnh sửa thông tin
          </button>
        )}
      </div>
      <p className="profile-intro__bio">
        {usersProfile?.bio || "Chưa có thông tin giới thiệu."}
      </p>
    </div>
  );
};

export default ProfileIntro;
