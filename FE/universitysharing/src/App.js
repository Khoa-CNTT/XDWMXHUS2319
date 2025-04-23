import "./App.css";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import Login from "./views/Login";
import Register from "./views/Register";
import ForgotPass from "./views/ForgotPassword";
import ResetForgotPassword from "./views/ResetForgotPassword";
import Homeview from "./views/HomeView";
import SharingRideView from "./views/SharingRideView";
import YourRideView from "./views/YourRideView";
import MessageView from "./views/MessageView";
import ProfileUserView from "./views/ProfileUserView";
import AccountVerified from "./components/AccountVerified";
import SearchView from "./views/SearchView";
import ResultSearchView from "./views/ResultSearchView";
import Notifications from "./views/Notifications";

import ChatBotAIView from "./views/ChatBotAIView";

import FriendProfileView from "./views/FriendProfileView";

import getUserIdFromToken from "./utils/JwtDecode";
import FriendView from "./views/FriendView";
import CommentModalBackGround from "./components/CommentModalBackgroud.";
import { useDispatch } from "react-redux";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SignalRProvider, useSignalR } from "../src/Service/SignalRProvider";
import { useAuth } from "./contexts/AuthContext";
import { AxiosConfigProvider } from "../src/Service/axiosClient";
import { notificationHandlers } from "./utils/notificationHandlers";
import { addRealTimeNotification } from "./stores/action/notificationAction";

// Component to handle global SignalR events
const SignalRHandler = () => {
  const { signalRService, isConnected } = useSignalR();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isConnected || !signalRService) return;

    const handleNotification = (eventName) => (notificationData) => {
      console.log(`[App] Nhận được ${eventName}:`, notificationData);
      const handler = notificationHandlers[eventName];
      if (!handler) {
        console.warn(`Không tìm thấy handler cho sự kiện: ${eventName}`);
        return;
      }

      const newNotification = handler.mapToNotification(notificationData);
      console.log("Thông báo đã map:", newNotification);

      // Dispatch action để thêm thông báo vào store Redux
      dispatch(addRealTimeNotification(newNotification));

      // Chỉ hiển thị toast nếu không phải là thông báo friend request (vì đã có UI trong modal)
      if (eventName !== "receivefriendnotification") {
        toast.info(newNotification.title);
      }
    };

    // Đăng ký tất cả sự kiện notification
    Object.keys(notificationHandlers).forEach((eventName) => {
      signalRService.on(
        signalRService.notificationConnection,
        eventName,
        handleNotification(eventName)
      );
    });

    return () => {
      // Hủy đăng ký khi component unmount
      Object.keys(notificationHandlers).forEach((eventName) => {
        signalRService.off(eventName, signalRService.notificationConnection);
      });
    };
  }, [isConnected, signalRService, dispatch]);

  return null;
};

import Dashboard from "./admin/views/DashBoardView";
import UserReport from "./admin/views/UserReportManagerView";

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const state = location.state;
  const background = state && state.background;

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/login") {
      window.history.replaceState(null, "", "/home");
    }
  }, [isAuthenticated, location.pathname]);

  return (
    <>
      <ToastContainer />
      <NotificationProvider>
        <AxiosConfigProvider />
        <SignalRProvider>

          <SignalRHandler /> {/* Thêm component xử lý SignalR toàn cục */}

          <Routes location={background || location}>
            {isAuthenticated ? (
              <>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/userreport" element={<UserReport />} />
                <Route path="/home" element={<Homeview />} />
                <Route path="/search" element={<SearchView />} />
                <Route path="/sharing-ride" element={<SharingRideView />} />
                <Route path="/your-ride" element={<YourRideView />} />
                <Route path="/post/:id" element={<Homeview />} />
                <Route path="/MessageView" element={<MessageView />} />
                <Route path="/ProfileUserView" element={<ProfileUserView />} />
                <Route
                  path="/profile/:userId"
                  element={<FriendProfileView />}
                />

                <Route path="/friend" element={<FriendView />} />

                <Route
                  path="/ResultSearchView"
                  element={<ResultSearchView />}
                />
                <Route path="/notify" element={<Notifications />} />
                <Route path="/chatBoxAI/:conversationId?" element={<ChatBotAIView />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPass />} />
                <Route path="/resetFP" element={<ResetForgotPassword />} />
                <Route path="/AccountVerified" element={<AccountVerified />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
          {background && isAuthenticated && (
            <Routes>
              <Route path="/post/:id" element={<CommentModalBackGround />} />
            </Routes>
          )}
        </SignalRProvider>
      </NotificationProvider>
    </>
  );
}

export default App;
