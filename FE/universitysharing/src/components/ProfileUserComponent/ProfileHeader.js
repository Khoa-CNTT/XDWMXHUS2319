import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import EditProfileModal from "./EditProfileModal";
import { userProfileDetail } from "../../stores/action/profileActions";
import { fetchFriends } from "../../stores/action/friendAction";
import "../../styles/ProfileUserView/ProfileHeader.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import logoWeb from "../../assets/Logo.png";
import "../../styles/MoblieReponsive/UsersProfileMoblie/ProfileViewMobile.scss";

const ProfileHeader = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usersProfile = useSelector((state) => state.users.usersProfile);
  const friendsData = useSelector((state) => state.friends.listFriends);
  // Cho phép component cha gọi hàm mở modal
  useImperativeHandle(ref, () => ({
    openModal: () => setIsModalOpen(true),
  }));

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(userProfileDetail());
    dispatch(fetchFriends());
  }, [dispatch, isModalOpen]);

  return (
    <div className="profile-header">
      <div className="profile-header__background">
        <img
          src={usersProfile?.backgroundPicture || logoWeb}
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
            <p className="profile-header__stats">
              {friendsData?.countFriend || 0} bạn bè
            </p>
            <span className="profile-header__trust">
              Điểm uy tín: {usersProfile?.trustPoints || 0}
            </span>
          </div>
          <button
            className="profile-header__edit-button"
            onClick={handleOpenModal}
          >
            Chỉnh sửa trang cá nhân
          </button>
        </div>
      </div>
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shouldFocusBio={props.shouldFocusBio}
        onModalOpened={props.onModalOpened}
      />
    </div>
  );
});

export default ProfileHeader;
