import "./App.css";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
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
import { useSelector, useDispatch } from "react-redux";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SignalRProvider, useSignalR } from "../src/Service/SignalRProvider";
import { useAuth } from "./contexts/AuthContext";
import { AxiosConfigProvider } from "../src/Service/axiosClient";
import { notificationHandlers } from "./utils/notificationHandlers";
import { addRealTimeNotification } from "./stores/action/notificationAction";

import Dashboard from "./admin/views/DashBoardView";
import UserReport from "./admin/views/UserReportManagerView";

import { DeeplinkCommentModal } from "./stores/action/deepLinkAction";
import CommentModalDeepLink from "./components/CommentModalDeepLink";

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = location.state;
  const background = state && state.background;
  const isSelectPostOpen = useSelector(
    (state) => state.deeplink.isSelectPostOpen
  );
  const error = useSelector((state) => state.deeplink.error);

  // useEffect(() => {
  //   if (isAuthenticated && location.pathname === "/login") {
  //     window.history.replaceState(null, "", "/home");
  //   }
  // }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    // Chuyển hướng nếu đã đăng nhập và truy cập /login
    if (isAuthenticated && location.pathname === "/login") {
      navigate("/home", { replace: true });
    }

    // Tách postId từ URL và dispatch action
    const pathMatch = location.pathname.match(/^\/post\/(.+)$/);
    if (pathMatch) {
      const postId = pathMatch[1]; // Ví dụ: 8e9dcfc8-0b5d-4244-a615-e00c0ae7455f
      // Kiểm tra UUID hợp lệ
      console.error("POST ID TỪ APP:", postId);
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(postId)) {
        console.error("postId không hợp lệ:", postId);
        navigate("/home", { replace: true });
        return;
      }
      if (isAuthenticated) {
        dispatch(DeeplinkCommentModal(postId));
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, dispatch, navigate]);

  useEffect(() => {
    // Hiển thị thông báo lỗi nếu có
    if (error) {
      toast.error(error || "Không thể tải bài viết");
    }
  }, [error]);

  return (
    <>
      <ToastContainer />
      <NotificationProvider>
        <AxiosConfigProvider />
        <SignalRProvider>
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
                <Route
                  path="/chatBoxAI/:conversationId?"
                  element={<ChatBotAIView />}
                />
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
          {/* {background && isAuthenticated && (
            <Routes>
              <Route path="/post/:id" element={<CommentModalBackGround />} />
            </Routes>
          )} */}
          {isAuthenticated && <CommentModalBackGround />}
        </SignalRProvider>
      </NotificationProvider>
    </>
  );
}

export default App;
