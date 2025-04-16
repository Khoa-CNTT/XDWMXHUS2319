import { createContext, useContext, useEffect, useState } from "react";
import signalRService from "../Service/signalRService";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch } from "react-redux";
import { setOnlineStatus, setUserOnline, setUserOffline } from "../stores/reducers/onlineSlice";
const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const { token, isAuthenticated, userId, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    // Sửa: Chờ auth hoàn tất
    if (isLoading || !isAuthenticated || !token || !userId) {
      console.log("[SignalRProvider] Chờ auth hoàn tất", {
        isLoading,
        isAuthenticated,
        token: !!token,
        userId: !!userId,
      });
      setIsConnected(false);
      signalRService.stopConnections().catch((err) => {
        console.error("[SignalRProvider] Lỗi ngắt kết nối:", err.message);
      });
      return;
    }

    let isMounted = true;

    const initializeSignalR = async () => {
      try {
        console.log("[SignalRProvider] Khởi tạo SignalR...");
        await signalRService.startConnections(token, userId);
        if (isMounted) {
          setIsConnected(true);
          console.log("[SignalRProvider] SignalR kết nối thành công");
          // Đăng ký sự kiện online/offline
          signalRService.onInitialOnlineUsers((onlineUsers) => {
            const status = onlineUsers.reduce((acc, id) => {
              acc[id] = true;
              return acc;
            }, {});
            dispatch(setOnlineStatus(status));
            console.log("[SignalRProvider] Nhận InitialOnlineUsers:", status);
          });

          signalRService.onUserOnline((userId) => {
            dispatch(setUserOnline(userId));
            console.log("[SignalRProvider] User online:", userId);
          });

          signalRService.onUserOffline((userId) => {
            dispatch(setUserOffline(userId));
            console.log("[SignalRProvider] User offline:", userId);
          });
        }
      } catch (err) {
        console.error("[SignalRProvider] Lỗi khởi tạo SignalR:", err.message);
        if (isMounted) {
          setIsConnected(false);
          // Sửa: Retry sau 5s
          setTimeout(initializeSignalR, 5000);
        }
      }
    };

    initializeSignalR();

    return () => {
      isMounted = false;
      console.log("[SignalRProvider] Cleanup SignalR");
      signalRService.stopConnections().catch((err) => {
        console.error("[SignalRProvider] Lỗi ngắt kết nối:", err.message);
      });
      setIsConnected(false);
    };
  }, [isAuthenticated, token, userId, isLoading]);

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