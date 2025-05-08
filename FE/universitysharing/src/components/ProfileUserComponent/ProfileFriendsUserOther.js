import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendPreview } from "../../stores/action/friendAction";
import FriendListModal from "../FriendListModal"; // New modal component
import "../../styles/ProfileUserView/ProfileFriends.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import getUserIdFromToken from "../../utils/JwtDecode";
import { useNavigate } from "react-router-dom";
const ProfileFriendsUserOther = ({ usersProfile }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const friendPreview = useSelector((state) => state.friends.friendPreview);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  }; // Load friend-related data on modal open
  useEffect(() => {
    if (usersProfile?.id) {
      dispatch(fetchFriendPreview(usersProfile.id));
    }
  }, [dispatch, usersProfile?.id]);

  return (
    <div className="profile-friends">
      <div className="profile-friends__header">
        <h2>Bạn bè</h2>
        <button
          className="profile-friends__view-all"
          onClick={() => setIsModalOpen(true)}
        >
          Xem tất cả
        </button>
      </div>
      <div className="profile-friends__list">
        {friendPreview?.slice(0, 5).map((friend) => (
          <div key={friend.friendId} className="profile-friends__item">
            <img
              src={friend.pictureProfile || avatarDefaut}
              alt={friend.fullName}
              className="profile-friends__avatar"
            />
            <span
              className="profile-friends__name"
              onClick={() => navigateUser(friend.friendId)}
            >
              {friend.fullName}
            </span>
          </div>
        ))}
      </div>
      <FriendListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={usersProfile?.id}
      />
    </div>
  );
};

export default ProfileFriendsUserOther;
