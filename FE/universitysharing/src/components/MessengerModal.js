import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFriends } from "../../src/stores/action/friendAction";
import {
  FiSearch,
  FiMoreHorizontal,
  FiVideo,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";

import { BsFilter } from "react-icons/bs";
import { toast } from "react-toastify";
import ChatBox from "./MessageComponent/ChatBox";
import { useSignalR } from "../Service/SignalRProvider";
import { useAuth } from "../contexts/AuthContext";
import axiosClient from "../Service/axiosClient";
import "../styles/MessengerModal.scss";

import "../styles/MoblieReponsive/HomeViewMobile/MessengerModalMobile.scss";

import avatarDefault from "../assets/AvatarDefault.png";

const FriendItem = React.memo(({ conv, unreadCount, onClick }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const formatMessageDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`friend-item ${unreadCount > 0 ? "unread" : ""} ${
        isPulsing ? "pulse" : ""
      }`}
      onClick={onClick}
    >
      <div className="friend-avatar">
        <img
          src={conv.user.profilePicture || avatarDefault}
          alt={conv.user.fullName}
          onError={(e) => {
            e.target.src = avatarDefault;
          }}
        />
      </div>
      <div className="friend-info">
        <div className="friend-name">{conv.user.fullName}</div>
        {conv.lastMessage ? (
          <div className="friend-preview">
            <span className="message-preview">
              {conv.lastMessage.length > 20
                ? `${conv.lastMessage.substring(0, 20)}...`
                : conv.lastMessage}
            </span>
            <span className="message-time">
              {formatMessageDate(conv.lastMessageDate)}
            </span>
          </div>
        ) : (
          <div className="friend-status">No messages yet</div>
        )}
      </div>
      {unreadCount > 0 && (
        <div className="unread-badge">
          <span className="unread-count">{unreadCount}</span>
        </div>
      )}
      <div className="friend-actions">
        <button className="action-button" title="More options">
          <FiMoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
});

const MessengerModal = ({ isOpen, onClose, position }) => {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openChats, setOpenChats] = useState([]);

  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const {
    friends,
    loading: friendsLoading,
    error: friendsError,
  } = useSelector((state) => state.friends);
  const { signalRService } = useSignalR();
  const { token, userId } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!token || !userId) {
      console.warn("[MessengerModal] Thiếu token hoặc userId");
      return;
    }
    try {
      const response = await axiosClient.get("api/Message/inbox", {
        params: { pageSize: 20 },
      });

      // console.error("Nhận lại từ API Inbox", response);
      const { data } = response.data;
      const uniqueConversations = Array.from(
        new Map(data.inBox.map((conv) => [conv.conversationId, conv])).values()
      );
      setConversations(uniqueConversations);
      const initialUnreadCounts = {};
      uniqueConversations.forEach((conv) => {
        if (conv.unreadCount > 0) {
          initialUnreadCounts[conv.user.id] = conv.unreadCount;
        }
      });
      setUnreadCounts(initialUnreadCounts);
      console.log(
        "[MessengerModal] Fetched unique conversations:",
        uniqueConversations
      );
    } catch (err) {
      console.error(
        "[MessengerModal] Lỗi khi lấy danh sách hội thoại:",
        err.message
      );
      toast.error("Không thể tải danh sách hội thoại");
    }
  }, [token, userId]);

  useEffect(() => {
    if (!isOpen || !token || !userId) {
      console.log("[MessengerModal] Dừng useEffect vì thiếu điều kiện");
      return;
    }

    let isMounted = true;

    const setupSignalREvents = () => {
      signalRService.onReceiveUnreadCount((unreadCount) => {
        console.log("[MessengerModal] Nhận unreadCount tổng:", unreadCount);
        if (isMounted) {
          fetchConversations();
        }
      });

      signalRService.onReceiveMessageNotification((notification) => {
        console.warn(
          "[MessengerModal] Nhận thông báo tin nhắn ddd:",
          notification
        );
        const { SenderId, Content, MessageId } = notification;

        if (isMounted) {
          setConversations((prev) => {
            const exists = prev.some((conv) => conv.user.id === SenderId);
            if (exists) {
              return prev.map((conv) =>
                conv.user.id === SenderId
                  ? {
                      ...conv,
                      lastMessage: Content,
                      lastMessageDate: new Date().toISOString(),
                      unreadCount: (conv.unreadCount || 0) + 1,
                    }
                  : conv
              );
            }
            return [
              ...prev,
              {
                conversationId: `temp-${MessageId}`,
                user: { id: SenderId, fullName: "Unknown", profilePicture: "" },
                lastMessage: Content,
                lastMessageDate: new Date().toISOString(),
                unreadCount: 1,
                isSeen: false,
              },
            ];
          });

          setUnreadCounts((prev) => ({
            ...prev,
            [SenderId]: (prev[SenderId] || 0) + 1,
          }));

          if (!document.hasFocus()) {
            const sender = conversations.find(
              (conv) => conv.user.id === SenderId
            );
            console.log(
              "[MessengerModal] Tab không focus, bắt đầu nhấp nháy:",
              sender?.user.fullName
            );
            startTabBlink(
              `${sender?.user.fullName || "Ai đó"} đã gửi bạn 1 tin nhắn`
            );
          }
        }
      });
    };

    fetchConversations();
    setupSignalREvents();

    return () => {
      isMounted = false;
      signalRService.off("ReceiveUnreadCount");
      signalRService.off("ReceiveMessageNotification");
      console.log("[MessengerModal] Đã hủy đăng ký sự kiện SignalR");
    };
  }, [isOpen, token, userId, signalRService, fetchConversations]);

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

      setUnreadCounts((prev) => ({
        ...prev,
        [friendId]: 0,
      }));
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === friendId
            ? { ...conv, unreadCount: 0, isSeen: true }
            : conv
        )
      );
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

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const isGroup = conv.isGroup; // Giả sử API trả về isGroup
      return (
        conv.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (activeTab === "all" ||
          (activeTab === "unread" && (unreadCounts[conv.user.id] || 0) > 0) ||
          (activeTab === "groups" && isGroup))
      );
    });
  }, [conversations, searchQuery, activeTab, unreadCounts]);

  if (!isOpen) return null;

  return (
    <>
      <div className="messenger-modal-background"> </div>
      <div
        className="messenger-modal-overlay"
        style={{
          top: `${position?.top || 0}px`,
          right: `${position?.right || 20}px`,
        }}
      >
        <div
          className={`messenger-modal ${isOpen ? "open" : ""}`}
          // ref={modalRef}
        >
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
              Unread (
              {Object.values(unreadCounts).reduce(
                (sum, count) => sum + (count || 0),
                0
              )}
              )
            </button>
            <button
              className={`tab ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              Groups
            </button>
          </div>

          <div className="friends-list">
            {friendsLoading ? (
              <div className="loading">Loading...</div>
            ) : friendsError ? (
              <div className="error">{friendsError}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty">Không có cuộc trò chuyện nào</div>
            ) : (
              filteredConversations.map((conv) => (
                <FriendItem
                  key={conv.conversationId}
                  conv={conv}
                  unreadCount={unreadCounts[conv.user.id] || 0}
                  onClick={() => handleOpenChat(conv.user.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
      {openChats.map((friendId, index) => (
        <ChatBox
          key={friendId}
          friendId={friendId}
          onClose={() => handleCloseChat(friendId)}
          index={index}
        />
      ))}
    </>
  );
};

export default MessengerModal;
