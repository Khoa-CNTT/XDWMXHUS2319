import { createContext, useContext, useEffect, useState, useRef } from "react";
import signalRService from "../Service/signalRService";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch } from "react-redux";
import {
  setOnlineStatus,
  setUserOnline,
  setUserOffline,
  setLoading,
  setError,
  resetOnlineStatus,
} from "../stores/reducers/onlineSlice";

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const { token, isAuthenticated, userId, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  const isMountedRef = useRef(true);
  const connectionAttemptRef = useRef(0);

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
        if (!signalRService.notificationConnection || !signalRService.chatConnection || !signalRService.aiConnection) {
          throw new Error("[SignalRProvider] Một hoặc nhiều kết nối SignalR không được khởi tạo");
        }
        if (signalRService.aiConnection.state !== "Connected") {
          throw new Error("[SignalRProvider] aiConnection không ở trạng thái Connected");
        }
        if (!isMountedRef.current) return;

        setIsConnected(true);
        dispatch(setError(null));
        console.log("[SignalRProvider] SignalR kết nối thành công");
        connectionAttemptRef.current = 0;

        signalRService.onInitialOnlineUsers((onlineUsers) => {
          let usersArray = onlineUsers;
          if (!Array.isArray(onlineUsers)) {
            console.warn("[SignalRProvider] Dữ liệu initialOnlineUsers không phải mảng:", onlineUsers);
            if (onlineUsers && typeof onlineUsers === "object") {
              usersArray = Array.from(onlineUsers);
              console.log("[SignalRProvider] Đã chuyển đổi dữ liệu thành mảng:", usersArray);
            } else {
              console.error("[SignalRProvider] Không thể xử lý initialOnlineUsers data:", onlineUsers);
              dispatch(setError("Dữ liệu initialOnlineUsers không hợp lệ"));
              return;
            }
          }

          if (!usersArray.every((id) => typeof id === "string")) {
            console.error("[SignalRProvider] Dữ liệu initialOnlineUsers chứa userId không hợp lệ:", usersArray);
            dispatch(setError("Dữ liệu initialOnlineUsers chứa userId không hợp lệ"));
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
            console.warn("[SignalRProvider] Bỏ qua userOnline vì SignalR chưa kết nối");
            return;
          }
          if (typeof userId !== "string" || !userId) {
            console.error("[SignalRProvider] Invalid userId in userOnline:", userId);
            dispatch(setError("userId không hợp lệ trong userOnline"));
            return;
          }
          dispatch(setUserOnline(userId));
          console.log("[SignalRProvider] User online:", userId);
        });

        signalRService.onUserOffline((userId) => {
          if (!isConnected) {
            console.warn("[SignalRProvider] Bỏ qua userOffline vì SignalR chưa kết nối");
            return;
          }
          if (typeof userId !== "string" || !userId) {
            console.error("[SignalRProvider] Invalid userId in userOffline:", userId);
            dispatch(setError("userId không hợp lệ trong userOffline"));
            return;
          }
          dispatch(setUserOffline(userId));
          console.log("[SignalRProvider] User offline:", userId);
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

  }, [isAuthenticated, token, userId, isConnected,isLoading, dispatch]);

  return (
    <SignalRContext.Provider value={{ signalRService, isConnected }}>
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