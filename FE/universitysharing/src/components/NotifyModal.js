import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/NotifyModal.scss";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchNotificationsUnread,
  fetchNotificationsRead,
  markNotificationAsRead,
} from "../stores/action/notificationAction";
import { toast } from "react-toastify";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../stores/action/friendAction";
import avatarWeb from "../assets/AvatarDefault.png";
import { useSignalR } from "../Service/SignalRProvider";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes";
import { debounce } from "lodash";

// Helper function to format relative time in Vietnamese
const formatRelativeTime = (createdAt) => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;

  return notificationTime.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

const NotifyModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const { signalRService, registerNotifyModal } = useSignalR();
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] = useState(false);
  const {
    notifications = [],
    unreadNotifications = [],
    readNotifications = [],
    loading = false,
    hasMore = false,
    nextCursor = null,
  } = useSelector((state) => state.notifications || {});
  const [processedNotifications, setProcessedNotifications] = useState(
    new Set()
  );
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // Thông báo trạng thái modal tới SignalRProvider
  useEffect(() => {
    if (signalRService) {
      registerNotifyModal(isOpen);
    }
  }, [isOpen, signalRService, registerNotifyModal]);

  // Tải dữ liệu ban đầu khi mở modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Chỉ tải dữ liệu nếu danh sách rỗng
      if (
        (activeTab === "Tất cả" && notifications.length === 0) ||
        (activeTab === "Chưa đọc" && unreadNotifications.length === 0) ||
        (activeTab === "Đã đọc" && readNotifications.length === 0)
      ) {
        fetchData(activeTab, null);
        setLastFetchedAt(new Date());
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [
    isOpen,
    onClose,
    activeTab,
    notifications.length,
    unreadNotifications.length,
    readNotifications.length,
  ]);

  // Debounce API calls
  const fetchData = useCallback(
    debounce((tab, cursor) => {
      if (tab === "Tất cả") {
        dispatch(fetchNotifications(cursor));
      } else if (tab === "Chưa đọc") {
        dispatch(fetchNotificationsUnread(cursor));
      } else if (tab === "Đã đọc") {
        dispatch(fetchNotificationsRead(cursor));
      }
    }, 500),
    [dispatch]
  );

  const lastNotificationRef = useCallback(
    (node) => {
      if (loading || !hasMore || !isInfiniteScrollEnabled) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchData(activeTab, nextCursor);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [
      loading,
      hasMore,
      isInfiniteScrollEnabled,
      activeTab,
      nextCursor,
      fetchData,
    ]
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsInfiniteScrollEnabled(false);
    // Chỉ tải dữ liệu nếu danh sách rỗng
    if (
      (tab === "Tất cả" && notifications.length === 0) ||
      (tab === "Chưa đọc" && unreadNotifications.length === 0) ||
      (tab === "Đã đọc" && readNotifications.length === 0)
    ) {
      fetchData(tab, null);
      setLastFetchedAt(new Date());
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchData(activeTab, nextCursor);
      setIsInfiniteScrollEnabled(true);
      setLastFetchedAt(new Date());
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await dispatch(markNotificationAsRead(notification.id)).unwrap();
      }
      navigate(notification.url);
      onClose();
    } catch (error) {
      console.error("Lỗi khi xử lý click thông báo:", error);
      navigate(notification.url);
      onClose();
    }
  };

  const handleAcceptFriend = useCallback(
    async (notificationId, senderId, e) => {
      e.stopPropagation();
      try {
        if (!senderId)
          throw new Error("Thiếu ID người gửi cho lời mời kết bạn");
        await dispatch(acceptFriendRequest(senderId)).unwrap();
        toast.success("Đã chấp nhận lời mời kết bạn");
        setProcessedNotifications((prev) => new Set(prev).add(notificationId));
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra khi chấp nhận lời mời");
      }
    },
    [dispatch]
  );

  const handleRejectFriend = useCallback(
    async (notificationId, senderId, e) => {
      e.stopPropagation();
      try {
        if (!senderId)
          throw new Error("Thiếu ID người gửi cho lời mời kết bạn");
        await dispatch(rejectFriendRequest(senderId)).unwrap();
        toast.success("Đã từ chối lời mời kết bạn");
        setProcessedNotifications((prev) => new Set(prev).add(notificationId));
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra khi từ chối lời mời");
      }
    },
    [dispatch]
  );

  if (!isOpen) return null;

  const displayedNotifications =
    activeTab === "Tất cả"
      ? notifications
      : activeTab === "Chưa đọc"
      ? unreadNotifications
      : readNotifications;

  const recentNotifications = displayedNotifications.filter(
    (notif) =>
      new Date(notif.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const olderNotifications = displayedNotifications.filter(
    (notif) =>
      new Date(notif.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  return (
    <div className="notify-modal" ref={modalRef}>
      <div className="modal-header">
        <h3>Thông báo</h3>
      </div>
      <div className="modal-navigation">
        <div
          className={`nav-item ${activeTab === "Tất cả" ? "active" : ""}`}
          onClick={() => handleTabClick("Tất cả")}
        >
          Tất cả
        </div>
        <div
          className={`nav-item ${activeTab === "Chưa đọc" ? "active" : ""}`}
          onClick={() => handleTabClick("Chưa đọc")}
        >
          Chưa đọc
        </div>
        <div
          className={`nav-item ${activeTab === "Đã đọc" ? "active" : ""}`}
          onClick={() => handleTabClick("Đã đọc")}
        >
          Đã đọc
        </div>
      </div>
      <div className="modal-content">
        {displayedNotifications.length === 0 && !loading ? (
          <div className="empty-state">Không có thông báo nào</div>
        ) : (
          <div className="notification-section">
            {activeTab === "Tất cả" && (
              <>
                <h3>Mới</h3>
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif, index) => (
                    <div
                      key={notif.id}
                      ref={
                        isInfiniteScrollEnabled &&
                        index === recentNotifications.length - 1 &&
                        olderNotifications.length === 0
                          ? lastNotificationRef
                          : null
                      }
                      className={`notification-body ${
                        !notif.isRead ? "unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification-content">
                        <img
                          src={notif.senderProfilePicture || avatarWeb}
                          alt="avatar"
                          className="avatar"
                        />
                        <div className="notification-text">
                          <p className="title">{notif.title}</p>
                          {
                            notif.type === NOTIFICATION_TYPES.SEND_FRIEND
                            // notif.mutualFriendsCount !== undefined && (
                            //   <span className="mutual-friends">
                            //     {notif.mutualFriendsCount} bạn chung
                            //   </span>
                            // )
                          }
                          <span className="time">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>
                      {notif.type === NOTIFICATION_TYPES.SEND_FRIEND &&
                        !processedNotifications.has(notif.id) && (
                          <div className="friend-request-actions">
                            <button
                              className="accept-button"
                              onClick={(e) =>
                                handleAcceptFriend(notif.id, notif.senderId, e)
                              }
                            >
                              Chấp nhận
                            </button>
                            <button
                              className="decline-button"
                              onClick={(e) =>
                                handleRejectFriend(notif.id, notif.senderId, e)
                              }
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Không có thông báo mới</div>
                )}
                {olderNotifications.length > 0 && (
                  <div className="notification-section">
                    <h3>Trước đó</h3>
                    {olderNotifications.map((notif, index) => (
                      <div
                        key={notif.id}
                        ref={
                          isInfiniteScrollEnabled &&
                          index === olderNotifications.length - 1
                            ? lastNotificationRef
                            : null
                        }
                        className={`notification-body ${
                          !notif.isRead ? "unread" : ""
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="notification-content">
                          <img
                            src={notif.senderProfilePicture || avatarWeb}
                            alt="avatar"
                            className="avatar"
                          />
                          <div className="notification-text">
                            <p className="title">{notif.title}</p>
                            {notif.type === NOTIFICATION_TYPES.SEND_FRIEND &&
                              notif.mutualFriendsCount !== undefined && (
                                <span className="mutual-friends">
                                  {notif.mutualFriendsCount} bạn chung
                                </span>
                              )}
                            <span className="time">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                        {notif.type === NOTIFICATION_TYPES.SEND_FRIEND &&
                          !processedNotifications.has(notif.id) && (
                            <div className="friend-request-actions">
                              <button
                                className="accept-button"
                                onClick={(e) =>
                                  handleAcceptFriend(
                                    notif.id,
                                    notif.senderId,
                                    e
                                  )
                                }
                              >
                                Chấp nhận
                              </button>
                              <button
                                className="decline-button"
                                onClick={(e) =>
                                  handleRejectFriend(
                                    notif.id,
                                    notif.senderId,
                                    e
                                  )
                                }
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {(activeTab === "Chưa đọc" || activeTab === "Đã đọc") &&
              displayedNotifications.map((notif, index) => (
                <div
                  key={notif.id}
                  ref={
                    isInfiniteScrollEnabled &&
                    index === displayedNotifications.length - 1
                      ? lastNotificationRef
                      : null
                  }
                  className={`notification-body ${
                    !notif.isRead ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-content">
                    <img
                      src={notif.senderProfilePicture || avatarWeb}
                      alt="avatar"
                      className="avatar"
                    />
                    <div className="notification-text">
                      <p className="title">{notif.title}</p>
                      {notif.type === NOTIFICATION_TYPES.SEND_FRIEND &&
                        notif.mutualFriendsCount !== undefined && (
                          <span className="mutual-friends">
                            {notif.mutualFriendsCount} bạn chung
                          </span>
                        )}
                      <span className="time">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                  {notif.type === NOTIFICATION_TYPES.SEND_FRIEND &&
                    !processedNotifications.has(notif.id) && (
                      <div className="friend-request-actions">
                        <button
                          className="accept-button"
                          onClick={(e) =>
                            handleAcceptFriend(notif.id, notif.senderId, e)
                          }
                        >
                          Chấp nhận
                        </button>
                        <button
                          className="decline-button"
                          onClick={(e) =>
                            handleRejectFriend(notif.id, notif.senderId, e)
                          }
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                </div>
              ))}
            {loading && <div>Đang tải...</div>}
            {!isInfiniteScrollEnabled && nextCursor && !loading && (
              <button onClick={handleLoadMore} className="load-more">
                Xem thêm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotifyModal;
