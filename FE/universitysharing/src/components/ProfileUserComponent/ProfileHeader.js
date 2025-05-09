import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import EditProfileModal from "./EditProfileModal";
import TrustScoreHistoryModal from "../TrustScoreHistoryModal";
import { userProfile } from "../../stores/action/profileActions";
import { fetchFriends } from "../../stores/action/friendAction";
import "../../styles/ProfileUserView/ProfileHeader.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import logoWeb from "../../assets/Logo.png";
import "../../styles/MoblieReponsive/UsersProfileMoblie/ProfileViewMobile.scss";

const ProfileHeader = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreditHistoryModal, setShowCreditHistoryModal] = useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
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

  // Hàm mở modal lịch sử điểm uy tín
  const handleOpenCreditHistoryModal = () => {
    // Dữ liệu giả lập lịch sử điểm uy tín (có thể thay bằng API)
    const mockCreditHistory = [
      {
        timestamp: "2025-05-07T10:00:00Z",
        change: 10,
        reason: "Hoàn thành chuyến đi đúng giờ",
        newCreditScore: (usersProfile?.trustScore || 0) + 10,
      },
      {
        timestamp: "2025-05-06T15:30:00Z",
        change: -5,
        reason: "Hủy chuyến đi",
        newCreditScore: (usersProfile?.trustScore || 0) - 5,
      },
      {
        timestamp: "2025-05-05T09:00:00Z",
        change: 15,
        reason: "Nhận đánh giá 5 sao",
        newCreditScore: (usersProfile?.trustScore || 0) + 15,
      },
    ];
    setCreditHistory(mockCreditHistory);
    setShowCreditHistoryModal(true);
  };

  useEffect(() => {
    dispatch(userProfile()); // Gọi cùng API với EditProfileModal
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
            <span
              className="profile-header__trust"
              onClick={handleOpenCreditHistoryModal}
              style={{ cursor: "pointer" }}
            >
              Điểm uy tín: {usersProfile?.trustScore || 0}
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
      <TrustScoreHistoryModal
        isOpen={showCreditHistoryModal}
        onClose={() => setShowCreditHistoryModal(false)}
        creditHistory={creditHistory}
      />
    </div>
  );
});

export default ProfileHeader;
