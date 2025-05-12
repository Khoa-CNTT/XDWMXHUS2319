import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
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
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState({
    "Tất cả": false,
    "Chưa đọc": false,
    "Đã đọc": false,
  });
  const [tabStates, setTabStates] = useState({
    "Tất cả": { hasMore: true, nextCursor: null },
    "Chưa đọc": { hasMore: true, nextCursor: null },
    "Đã đọc": { hasMore: true, nextCursor: null },
  });
  const {
    notifications = [],
    unreadNotifications = [],
    readNotifications = [],
    loading = false,
  } = useSelector((state) => state.notifications || {});
  const [processedNotifications, setProcessedNotifications] = useState(
    new Set()
  );
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // Debounce API calls
  const fetchData = useCallback(
    debounce((tab, cursor) => {
      const action = {
        "Tất cả": fetchNotifications,
        "Chưa đọc": fetchNotificationsUnread,
        "Đã đọc": fetchNotificationsRead,
      }[tab];

      dispatch(action(cursor)).then((response) => {
        const payload = response.payload || {};
        setTabStates((prev) => ({
          ...prev,
          [tab]: {
            hasMore:
              (payload.notifications?.length > 0 && !!payload.nextCursor) ||
              false,
            nextCursor: payload.nextCursor || null,
          },
        }));
      });
    }, 500),
    [dispatch]
  );

  // Tải dữ liệu ban đầu khi mở modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (!hasFetchedInitialData[activeTab]) {
        fetchData(activeTab, null);
        setHasFetchedInitialData((prev) => ({
          ...prev,
          [activeTab]: true,
        }));
        setLastFetchedAt(new Date());
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isOpen, onClose, activeTab, hasFetchedInitialData, fetchData]);

  const lastNotificationRef = useCallback(
    (node) => {
      if (loading || !tabStates[activeTab].hasMore || !isInfiniteScrollEnabled)
        return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && tabStates[activeTab].hasMore) {
          fetchData(activeTab, tabStates[activeTab].nextCursor);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, isInfiniteScrollEnabled, activeTab, fetchData, tabStates]
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsInfiniteScrollEnabled(false);
    if (!hasFetchedInitialData[tab]) {
      fetchData(tab, null);
      setHasFetchedInitialData((prev) => ({
        ...prev,
        [tab]: true,
      }));
      setLastFetchedAt(new Date());
    }
  };

  const handleLoadMore = () => {
    if (tabStates[activeTab].hasMore && !loading) {
      fetchData(activeTab, tabStates[activeTab].nextCursor);
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

  const displayedNotifications =
    activeTab === "Tất cả"
      ? notifications
      : activeTab === "Chưa đọc"
      ? unreadNotifications
      : readNotifications;

  const sortedDisplayedNotifications = useMemo(() => {
    return [...displayedNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [displayedNotifications]);

  const recentNotifications = useMemo(() => {
    return sortedDisplayedNotifications.filter(
      (notif) =>
        new Date(notif.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
  }, [sortedDisplayedNotifications]);

  const olderNotifications = useMemo(() => {
    return sortedDisplayedNotifications.filter(
      (notif) =>
        new Date(notif.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
  }, [sortedDisplayedNotifications]);

  if (!isOpen) return null;

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
        {loading &&
        hasFetchedInitialData[activeTab] &&
        sortedDisplayedNotifications.length === 0 ? (
          <div className="loading-state">Đang tải...</div>
        ) : sortedDisplayedNotifications.length === 0 &&
          !tabStates[activeTab].hasMore ? (
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
                          {notif.type === NOTIFICATION_TYPES.SEND_FRIEND && (
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
                            {notif.type === NOTIFICATION_TYPES.SEND_FRIEND && (
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
              sortedDisplayedNotifications.map((notif, index) => (
                <div
                  key={notif.id}
                  ref={
                    isInfiniteScrollEnabled &&
                    index === sortedDisplayedNotifications.length - 1
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
                      {notif.type === NOTIFICATION_TYPES.SEND_FRIEND && (
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
            {!tabStates[activeTab].hasMore &&
              sortedDisplayedNotifications.length > 0 &&
              !loading && (
                <div className="end-of-list">Đã tải hết thông báo</div>
              )}
            {!isInfiniteScrollEnabled &&
              tabStates[activeTab].hasMore &&
              tabStates[activeTab].nextCursor &&
              !loading && (
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
