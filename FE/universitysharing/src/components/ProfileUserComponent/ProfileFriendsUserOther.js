import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchListFriend } from "../../stores/action/friendAction";
import "../../styles/ProfileUserView/ProfileFriends.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";

const ProfileFriendsUserOther = ({ usersProfile }) => {
  const dispatch = useDispatch();
  const listFriend = useSelector((state) => state.friends.listFriendsByUser);

  useEffect(() => {
    dispatch(fetchListFriend(usersProfile?.id));
  }, [dispatch]);
  return (
    <div className="profile-friends">
      <div className="profile-friends__header">
        <h2>Bạn bè</h2>
        <a href="#" className="profile-friends__view-all">
          Xem tất cả
        </a>
      </div>
      <div className="profile-friends__list">
        {listFriend?.friends?.slice(0, 6).map(
          (
            friend,
            index // Hiển thị tối đa 6 bạn bè
          ) => (
            <div key={index} className="profile-friends__item">
              <img
                src={friend.pictureProfile || avatarDefaut}
                alt={friend.fullName}
                className="profile-friends__avatar"
              />
              <span className="profile-friends__name">{friend.fullName}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProfileFriendsUserOther;
