import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFriends } from "../../src/stores/action/friendAction";
import { FiSearch, FiMoreHorizontal, FiVideo, FiMessageSquare, FiX } from "react-icons/fi";
import { BsFilter } from "react-icons/bs";
import ChatBox from "./MessageComponent/ChatBox";
import signalRService from "../../src/Service/notificationSignalService";
import { jwtDecode } from "jwt-decode";
import "../styles/MessengerModal.scss";

const MessengerModal = ({ isOpen, onClose, position }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openChats, setOpenChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const { friends, loading, error } = useSelector((state) => state.friends);
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] : null;

  useEffect(() => {
    console.log("useEffect chạy với isOpen:", isOpen, "token:", token, "userId:", userId);
    if (!isOpen || !token || !userId) {
      console.log("Dừng useEffect vì isOpen, token hoặc userId không hợp lệ");
      return;
    }

    const initializeSignalR = async () => {
      try {
        console.log("Bắt đầu kết nối SignalR với UserId:", userId);
        await signalRService.startConnection(token, userId); // Truyền userId
        signalRService.onReceiveMessageNotification((notification) => {
          console.log("Nhận thông báo tin nhắn:", notification);
          const { SenderId, Content, MessageId } = notification;

          setUnreadMessages((prev) => {
            if (prev.some((msg) => msg.messageId === MessageId)) {
              console.log("Tin nhắn đã tồn tại, bỏ qua:", MessageId);
              return prev;
            }
            console.log("Thêm tin nhắn mới:", { SenderId, Content, MessageId });
            return [...prev, { senderId: SenderId, content: Content, messageId: MessageId }];
          });

          if (!document.hasFocus()) {
            const sender = friends.find((f) => f.friendId === SenderId);
            console.log("Tab không focus, bắt đầu nhấp nháy:", sender?.fullNameFriend);
            startTabBlink(`${sender?.fullNameFriend || "Ai đó"} đã gửi bạn 1 tin nhắn`);
          }
        });
      } catch (err) {
        console.error("Lỗi khởi tạo SignalR:", err);
      }
    };

    initializeSignalR();

    return () => {
      console.log("Ngắt kết nối SignalR");
      signalRService.stopConnection();
    };
  }, [isOpen, token, friends, userId]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFriends());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleOpenChat = (friendId) => {
    if (!openChats.includes(friendId)) {
      setOpenChats((prev) => [...prev, friendId]);
      setUnreadMessages((prev) => prev.filter((msg) => msg.senderId !== friendId));
      // TODO: Gọi API để đánh dấu IsSeen = true cho các tin nhắn của friendId
    }
  };

  const handleCloseChat = (friendId) => {
    setOpenChats((prev) => prev.filter((id) => id !== friendId));
  };

  const startTabBlink = (message) => {
    let isOriginal = true;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = isOriginal ? message : originalTitle;
      isOriginal = !isOriginal;
    }, 1000);

    const stopBlink = () => {
      clearInterval(interval);
      document.title = originalTitle;
    };

    window.addEventListener("focus", stopBlink, { once: true });
  };

  const getUnreadCount = (friendId) => {
    return unreadMessages.filter((msg) => msg.senderId === friendId).length;
  };

  if (!isOpen) return null;

  return (
    <div
      className="messenger-modal-overlay"
      style={{
        top: `${position?.top || 0}px`,
        right: `${position?.right || 20}px`,
      }}
    >
      <div className={`messenger-modal ${isOpen ? "open" : ""}`} ref={modalRef}>
        <div className="modal-header">
          <div className="header-left">
            <h2>Chat</h2>
            <div className="header-actions">
              <button className="icon-button" title="Video chat">
                <FiVideo size={18} />
              </button>
              <button className="icon-button" title="New message">
                <FiMessageSquare size={18} />
              </button>
            </div>
          </div>
          <div className="header-right">
            <button className="icon-button" title="Options">
              <FiMoreHorizontal size={18} />
            </button>
            <button className="close-button" onClick={onClose} title="Close">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-container">
            <div className="search-icon">
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Search Messenger"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="filter-button" title="Filter conversations">
              <BsFilter size={16} />
            </button>
          </div>
        </div>

        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`tab ${activeTab === "unread" ? "active" : ""}`}
            onClick={() => setActiveTab("unread")}
          >
            Unread ({unreadMessages.length})
          </button>
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        </div>

        <div className="friends-list">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            friends
              ?.filter(
                (friend) =>
                  friend &&
                  friend.fullNameFriend &&
                  friend.fullNameFriend.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((friend) => {
                const unreadCount = getUnreadCount(friend.friendId);
                const latestMessage = unreadMessages
                  .filter((msg) => msg.senderId === friend.friendId)
                  .slice(-1)[0];

                return (
                  <div
                    key={friend.friendId}
                    className="friend-item"
                    onClick={() => handleOpenChat(friend.friendId)}
                  >
                    <div className="friend-avatar">
                      <img
                        src={friend.avatar || "https://www.facebook.com/images/friends_empty.png"}
                        alt={friend.fullNameFriend}
                        onError={(e) => {
                          e.target.src = "https://www.facebook.com/images/friends_empty.png";
                        }}
                      />
                      {friend.active && <span className="active-badge"></span>}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{friend.fullNameFriend}</div>
                      {unreadCount > 0 && latestMessage ? (
                        <div className="friend-preview">
                          <span>{latestMessage.content.substring(0, 20)}...</span>
                          {unreadCount > 1 && <span> ({unreadCount} tin nhắn)</span>}
                        </div>
                      ) : (
                        <div className="friend-status">
                          {friend.active ? "Active now" : "Active recently"}
                        </div>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="unread-count">{unreadCount}</div>
                    )}
                    <div className="friend-actions">
                      <button className="action-button" title="More options">
                        <FiMoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {openChats.map((friendId) => (
          <ChatBox
            key={friendId}
            friendId={friendId}
            onClose={() => handleCloseChat(friendId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MessengerModal;