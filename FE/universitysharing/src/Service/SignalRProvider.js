import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import signalRService from "../Service/signalRService";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  setOnlineStatus,
  setUserOnline,
  setUserOffline,
  setLoading,
  setError,
  resetOnlineStatus,
} from "../stores/reducers/onlineSlice";
import { toast } from "react-toastify";
import { notificationHandlers } from "../utils/notificationHandlers";
import { addRealTimeNotification } from "../stores/action/notificationAction";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes"; // Import NOTIFICATION_TYPES

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const { token, isAuthenticated, userId, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false); // Theo dõi trạng thái NotifyModal
  const dispatch = useDispatch();
  const isMountedRef = useRef(true);
  const connectionAttemptRef = useRef(0);
  const displayedToasts = useRef(new Set());
  const { notifications = [] } = useSelector(
    (state) => state.notifications || {}
  );
  const delayedNotifications = useRef([]); // Lưu các thông báo trì hoãn (chỉ cho ACCEPT_RIDE)

  // Hàm để NotifyModal đăng ký trạng thái mở/đóng
  const registerNotifyModal = useCallback(
    (isOpen) => {
      setNotifyModalOpen(isOpen);

      // Khi NotifyModal mở, dispatch các thông báo trì hoãn
      if (isOpen && delayedNotifications.current.length > 0) {
        delayedNotifications.current.forEach((notification) =>
          dispatch(addRealTimeNotification(notification))
        );
        delayedNotifications.current = []; // Xóa sau khi dispatch
      }
    },
    [dispatch]
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      console.log("[SignalRProvider] Cleanup SignalR");
      signalRService.stopConnections().catch((err) => {
        console.error("[SignalRProvider] Lỗi ngắt kết nối:", err.message);
      });
      dispatch(resetOnlineStatus());
      setIsConnected(false);
    };
  }, [dispatch]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !token || !userId) {
      console.log("[SignalRProvider] Chờ auth hoàn tất", {
        isLoading,
        isAuthenticated,
        token: !!token,
        userId: !!userId,
      });
      setIsConnected(false);
      dispatch(resetOnlineStatus());
      signalRService.stopConnections().catch((err) => {
        console.error("[SignalRProvider] Lỗi ngắt kết nối:", err.message);
      });
      return;
    }

    const initializeSignalR = async () => {
      if (connectionAttemptRef.current >= 5) {
        console.error("[SignalRProvider] Đã vượt quá số lần thử kết nối");
        dispatch(setError("Không thể kết nối SignalR sau nhiều lần thử"));
        return;
      }

      try {
        console.log("[SignalRProvider] Khởi tạo SignalR...");
        dispatch(setLoading());
        connectionAttemptRef.current += 1;
        await signalRService.startConnections(token, userId);
        // Kiểm tra tất cả các kết nối
        if (
          !signalRService.notificationConnection ||
          !signalRService.chatConnection ||
          !signalRService.aiConnection
        ) {
          throw new Error(
            "[SignalRProvider] Một hoặc nhiều kết nối SignalR không được khởi tạo"
          );
        }
        if (signalRService.aiConnection.state !== "Connected") {
          throw new Error(
            "[SignalRProvider] aiConnection không ở trạng thái Connected"
          );
        }
        if (!isMountedRef.current) return;

        setIsConnected(true);
        dispatch(setError(null));
        console.log("[SignalRProvider] SignalR kết nối thành công");
        connectionAttemptRef.current = 0;

        // Hủy đăng ký tất cả các sự kiện trước khi đăng ký lại
        // Object.keys(notificationHandlers).forEach((eventName) => {
        //   signalRService.off(signalRService.notificationConnection, eventName);
        // });

        signalRService.onInitialOnlineUsers((onlineUsers) => {
          let usersArray = onlineUsers;
          if (!Array.isArray(onlineUsers)) {
            console.warn(
              "[SignalRProvider] Dữ liệu initialOnlineUsers không phải mảng:",
              onlineUsers
            );
            if (onlineUsers && typeof onlineUsers === "object") {
              usersArray = Array.from(onlineUsers);
              console.log(
                "[SignalRProvider] Đã chuyển đổi dữ liệu thành mảng:",
                usersArray
              );
            } else {
              console.error(
                "[SignalRProvider] Không thể xử lý initialOnlineUsers data:",
                onlineUsers
              );
              dispatch(setError("Dữ liệu initialOnlineUsers không hợp lệ"));
              return;
            }
          }

          if (!usersArray.every((id) => typeof id === "string")) {
            console.error(
              "[SignalRProvider] Dữ liệu initialOnlineUsers chứa userId không hợp lệ:",
              usersArray
            );
            dispatch(
              setError("Dữ liệu initialOnlineUsers chứa userId không hợp lệ")
            );
            return;
          }

          const status = usersArray.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {});
          dispatch(setOnlineStatus(status));
          console.log("[SignalRProvider] Nhận initialOnlineUsers:", status);
        });

        signalRService.onUserOnline((userId) => {
          if (!isConnected) {
            console.warn(
              "[SignalRProvider] Bỏ qua userOnline vì SignalR chưa kết nối"
            );
            return;
          }
          if (typeof userId !== "string" || !userId) {
            console.error(
              "[SignalRProvider] Invalid userId in userOnline:",
              userId
            );
            dispatch(setError("userId không hợp lệ trong userOnline"));
            return;
          }
          dispatch(setUserOnline(userId));
          console.log("[SignalRProvider] User online:", userId);
        });

        signalRService.onUserOffline((userId) => {
          if (!isConnected) {
            console.warn(
              "[SignalRProvider] Bỏ qua userOffline vì SignalR chưa kết nối"
            );
            return;
          }
          if (typeof userId !== "string" || !userId) {
            console.error(
              "[SignalRProvider] Invalid userId in userOffline:",
              userId
            );
            dispatch(setError("userId không hợp lệ trong userOffline"));
            return;
          }
          dispatch(setUserOffline(userId));
          console.log("[SignalRProvider] User offline:", userId);
        });
        // Đăng ký sự kiện thông báo
        Object.keys(notificationHandlers).forEach((eventName) => {
          signalRService.on(
            signalRService.notificationConnection,
            eventName,
            (notificationData) => {
              console.log(
                `[SignalRProvider] Nhận được ${eventName}:`,
                notificationData
              );
              const handler = notificationHandlers[eventName];
              if (!handler) {
                console.warn(
                  `Không tìm thấy handler cho sự kiện: ${eventName}`
                );
                return;
              }

              const newNotification =
                handler.mapToNotification(notificationData);

              // Kiểm tra xem thông báo đã tồn tại trong Redux store chưa
              if (
                !notifications.some((notif) => notif.id === newNotification.id)
              ) {
                dispatch(addRealTimeNotification(newNotification));

                // Hiển thị Toast nếu NotifyModal không mở và chưa hiển thị Toast cho thông báo này
                if (
                  !notifyModalOpen &&
                  !displayedToasts.current.has(newNotification.id)
                ) {
                  if (newNotification.type === NOTIFICATION_TYPES.ALERT) {
                    toast.warning(newNotification.title); // Toast warning cho ALERT
                    displayedToasts.current.add(newNotification.id);
                  } else if (
                    newNotification.type === NOTIFICATION_TYPES.ACCEPT_RIDE
                  ) {
                    toast.info(newNotification.title); // Toast info cho ACCEPT_RIDE
                    displayedToasts.current.add(newNotification.id);
                  }
                  // Các loại thông báo khác không hiển thị toast, nhưng vẫn được thêm vào danh sách thông báo
                }
              } else {
                console.log(
                  `[SignalRProvider] Bỏ qua thông báo trùng lặp: ${newNotification.id}`
                );
              }
            }
          );
        });
      } catch (err) {
        console.error("[SignalRProvider] Lỗi khởi tạo SignalR:", err.message);
        if (isMountedRef.current) {
          setIsConnected(false);
          dispatch(setError(err.message));
          setTimeout(initializeSignalR, 5000);
        }
      }
    };

    initializeSignalR();
    // return () => {
    //   Object.keys(notificationHandlers).forEach((eventName) => {
    //     signalRService.off(signalRService.notificationConnection, eventName);
    //   });
    // };
  }, [
    isAuthenticated,
    token,
    userId,
    isLoading,
    dispatch,
    notifyModalOpen,
    notifications,
  ]);

  return (
    <SignalRContext.Provider
      value={{ signalRService, isConnected, registerNotifyModal }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR phải được dùng trong SignalRProvider");
  }
  return context;
};
