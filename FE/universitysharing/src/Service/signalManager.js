import SignalRService from "../Service/signalRService";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

// Hook để quản lý vòng đời SignalR dựa trên trạng thái đăng nhập
export const useSignalRManager = () => {
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Khởi tạo SignalR khi người dùng đăng nhập
    if (isAuthenticated && token) {
      console.log("Bắt đầu kết nối SignalR vì người dùng đã đăng nhập");
      SignalRService.startConnections(token).catch((err) => {
        console.error("Không thể khởi động SignalR:", err.message);
      });
    }

    // Dọn dẹp khi người dùng đăng xuất hoặc component unmount
    return () => {
      if (isAuthenticated) {
        console.log("Ngắt kết nối SignalR khi component unmount hoặc đăng xuất");
        SignalRService.stopConnections().catch((err) => {
          console.error("Lỗi khi ngắt kết nối SignalR:", err.message);
        });
      }
    };
  }, [isAuthenticated, token]); // Theo dõi trạng thái đăng nhập và token
};

// Hàm tiện ích để truy cập SignalRService trong các component
export const getSignalRService = () => {
  return SignalRService;
};