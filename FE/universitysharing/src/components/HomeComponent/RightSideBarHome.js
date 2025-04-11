import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveFriend } from "../../stores/reducers/friendReducer";
import { fetchFriends } from "../../stores/action/friendAction";
import ChatBox from "../MessageComponent/ChatBox";
import "../../styles/MessageView/RightSidebar.scss";
import avatarDefault from "../../assets/AvatarDefault.png";
import signalRService from "../../Service/signalRService";
import { jwtDecode } from "jwt-decode";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { friends, loading, error, activeFriend } = useSelector(
    (state) => state.friends
  );
  const [openChats, setOpenChats] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const token = localStorage.getItem("token");
  const userId = token
    ? jwtDecode(token)[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ]
    : null;

  const friendIds = useMemo(() => friends.map((f) => f.friendId), [friends]);

  // Kiểm tra trạng thái online ban đầu qua API
  const checkOnlineStatus = useCallback(async () => {
    if (!friendIds.length || !token) return;

    try {
      const response = await fetch(
        "https/localhost:7053/api/Online/check-online",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(friendIds),
        }
      );
      const result = await response.json();
      if (result.success) {
        setOnlineStatus(result.data);
      }
    } catch (err) {
      console.error("Lỗi khi lấy trạng thái online:", err);
    }
  }, [friendIds, token]);

  // Khởi tạo SignalR
  useEffect(() => {
    if (!friendIds.length || !token) return;

    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection(token);

        // Xử lý danh sách user online ban đầu
        signalRService.onInitialOnlineUsers((onlineUsers) => {
          const newStatus = {};
          onlineUsers.forEach((id) => {
            newStatus[id] = true;
          });
          setOnlineStatus((prev) => ({ ...prev, ...newStatus }));
        });

        // User online
        signalRService.onUserOnline((userId) => {
          setOnlineStatus((prev) => ({ ...prev, [userId]: true }));
          console.log(`User ${userId} online`);
        });

        // User offline
        signalRService.onUserOffline((userId) => {
          setOnlineStatus((prev) => ({ ...prev, [userId]: false }));
          console.log(`User ${userId} offline`);
        });
      } catch (err) {
        console.error("Lỗi khi khởi tạo SignalR:", err);
      }
    };

    checkOnlineStatus();
    initializeSignalR();

    return () => {
      signalRService.stopConnection();
    };
  }, [friendIds, token, checkOnlineStatus]);

  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleFriendClick = useCallback(
    (friendId) => {
      dispatch(setActiveFriend(friendId));
      if (!openChats.includes(friendId)) {
        setOpenChats((prev) => [...prev, friendId]);
      }
    },
    [dispatch, openChats]
  );

  const handleCloseChat = useCallback(
    (friendId) => {
      setOpenChats((prev) => prev.filter((id) => id !== friendId));
      if (activeFriend === friendId) {
        dispatch(setActiveFriend(null));
      }
    },
    [activeFriend, dispatch]
  );

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return "";
    const diff = (new Date() - new Date(lastSeen)) / 1000 / 60; // Phút
    if (diff < 1) return "Vừa mới hoạt động";
    if (diff < 60) return `Hoạt động ${Math.floor(diff)} phút trước`;
    return `Hoạt động ${Math.floor(diff / 60)} giờ trước`;
  };

  if (loading) {
    return (
      <aside className="right-sidebar">
        <p>Đang tải...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="right-sidebar">
        <p>Lỗi: {error}</p>
      </aside>
    );
  }

  return (
    <>
      <aside className="right-sidebar">
        <div className="search-container">
          <h3>Bạn Bè</h3>
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm bạn bè..." />
          </div>
        </div>

        <div className="friends-list">
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.friendId}
                className={activeFriend === friend.friendId ? "active" : ""}
                onClick={() => handleFriendClick(friend.friendId)}
              >
                <div className="friend-info">
                  <img
                    src={friend.avatarFriend || avatarDefault}
                    alt="Avatar"
                  />
                  <div className="name-status">
                    <div className="friend-name">{friend.fullNameFriend}</div>
                    <div
                      className={`status ${
                        onlineStatus[friend.friendId] ? "online" : "offline"
                      }`}
                    >
                      {onlineStatus[friend.friendId]
                        ? "Online"
                        : getLastSeenText(friend.lastSeen)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {friends.length === 0 && (
              <div className="loading-error">Không tìm thấy bạn bè.</div>
            )}
          </ul>
        </div>
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
