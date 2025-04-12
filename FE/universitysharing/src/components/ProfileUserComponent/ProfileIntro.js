import React from "react";
import { useSelector } from "react-redux";
import "../../styles/ProfileUserView/ProfileIntro.scss";

const ProfileIntro = ({ onEditBioClick }) => {
  // Lấy trực tiếp từ store thay vì nhận qua props
  const usersProfile = useSelector((state) => state.users.usersProfile);

  return (
    <div className="profile-intro">
      <div className="profile-intro__header">
        <h2>Giới Thiệu</h2>
        <button
          className="profile-intro__edit-button"
          onClick={onEditBioClick} // Now this will work correctly
        >
          Chỉnh sửa thông tin
        </button>
      </div>
      <p className="profile-intro__bio">
        {usersProfile?.bio || "Chưa có thông tin giới thiệu."}
      </p>
    </div>
  );
};

export default ProfileIntro;
