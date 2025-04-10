// src/components/RightSidebar.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveFriend } from "../../stores/reducers/friendReducer";
import { fetchFriends } from "../../stores/action/friendAction";
import ChatBox from "../MessageComponent/ChatBox";
import "../../styles/headerHome.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { friends, loading, error, activeFriend } = useSelector((state) => state.friends);
  const [openChats, setOpenChats] = useState([]);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleFriendClick = (friendId) => {
    dispatch(setActiveFriend(friendId));
    if (!openChats.includes(friendId)) {
      setOpenChats([...openChats, friendId]);
    }
  };

  const handleCloseChat = (friendId) => {
    setOpenChats(openChats.filter((id) => id !== friendId));
    if (activeFriend === friendId) {
      dispatch(setActiveFriend(null));
    }
  };

  if (loading) {
    return <aside className="right-sidebar"><p>Đang tải...</p></aside>;
  }

  if (error) {
    return <aside className="right-sidebar"><p>Lỗi: {error}</p></aside>;
  }

  return (
    <>
      <aside className="right-sidebar">
        <h3>Bạn Bè</h3>
        <ul>
          {friends.map((friend) => (
            <li
              key={friend.friendId}
              className={activeFriend === friend.friendId ? "active" : ""}
              onClick={() => handleFriendClick(friend.friendId)}
            >
              <img src={avatarDefaut} alt="Avatar" />
              <span>{friend.fullNameFriend}</span>
            </li>
          ))}
        </ul>
      </aside>

      {openChats.map((friendId) => (
        <ChatBox
          key={friendId}
          friendId={friendId}
          onClose={() => handleCloseChat(friendId)}
        />
      ))}
    </>
  );
};

export default RightSidebar;