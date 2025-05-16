import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import signalRService from "../Service/signalRService";
import { useAuth } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [messData, setmessDatas] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const titleIntervalRef = useRef(null);
  const originalTitleRef = useRef(document.title || "University Sharing");
  const { token, userId, isAuthenticated } = useAuth();
  const retryIntervalRef = useRef(null);

  // Cập nhật tiêu đề tab
  const updateTitle = useCallback(() => {
    if (notifications.length === 0 || document.hasFocus()) {
      resetTitle();
      return;
    }

    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
    }

    let isOriginal = true;
    titleIntervalRef.current = setInterval(() => {
      const latestNotification = notifications[notifications.length - 1];
      const newTitle = isOriginal
        ? latestNotification
        : originalTitleRef.current;
      document.title = newTitle;
      isOriginal = !isOriginal;
    }, 2000);
  }, [notifications]);

  // Reset tiêu đề tab
  const resetTitle = useCallback(() => {
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
    }
    document.title = originalTitleRef.current;
    if (notifications.length > 0) {
      setNotifications([]);
    }
  }, [notifications]);

  // Xử lý focus/blur
  useEffect(() => {
    const handleFocus = () => resetTitle();
    const handleBlur = () => updateTitle();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      resetTitle();
    };
  }, [updateTitle, resetTitle]);

  // Khởi tạo SignalR
  useEffect(() => {
    if (!isAuthenticated || !token || !userId) {
      console.log(
        "[NotificationProvider] Thiếu token hoặc userId, ngắt kết nối SignalR"
      );
      setIsConnected(false);
      signalRService.stopConnections().catch((err) => {
        console.error(
          "[NotificationProvider] Lỗi khi ngắt kết nối:",
          err.message
        );
      });
      return;
    }

    let isMounted = true;

    const initializeSignalR = async () => {
      try {
        console.log(
          "[NotificationProvider] Bắt đầu khởi tạo SignalR...",
          userId.toString()
        );
        await signalRService.startConnections(token, userId.toString()); // Chuyển userId thành string
        if (isMounted) {
          setIsConnected(true);
          console.log("[NotificationProvider] SignalR kết nối thành công");

          signalRService.onReceiveMessageNotification((notification) => {
            if (!isMounted) return;
            console.warn(
              "[NotificationProvider] Nhận thông báo heheh:",
              notification
            );
            setNotifications((prev) => [...prev, notification]);
          });

          // signalRService.onReceiveMessageData((message) => {
          //   if (!isMounted) return;
          //   console.warn(
          //     "[NotificationProvider] Nhận thông báo data gửi về 🐧:",
          //     message
          //   );
          //   setmessDatas((prev) => [...prev, message]);
          // });
        }
      } catch (err) {
        if (isMounted) {
          console.error("[NotificationProvider] Lỗi khởi tạo SignalR:", {
            message: err.message,
            stack: err.stack,
          });
          setIsConnected(false);
          console.warn("[NotificationProvider] Thử lại kết nối sau 10s...");
          retryIntervalRef.current = setTimeout(initializeSignalR, 10000);
        }
      }
    };

    initializeSignalR();

    return () => {
      isMounted = false;
      if (retryIntervalRef.current) {
        clearTimeout(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      console.log("[NotificationProvider] Cleanup: Ngắt kết nối SignalR");
      signalRService.off(
        "ReceiveMessageNotification",
        signalRService.notificationConnection
      );
      signalRService.stopConnections().catch((err) => {
        console.error(
          "[NotificationProvider] Lỗi khi ngắt kết nối:",
          err.message
        );
      });
      setIsConnected(false);
    };
  }, [isAuthenticated, token, userId]);

  // Gọi updateTitle khi notifications thay đổi
  useEffect(() => {
    updateTitle();
  }, [notifications, updateTitle]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        resetTitle,
        isConnected,
        messData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
