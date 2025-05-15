// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Navigate,
//   Route,
//   Routes,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { AxiosConfigProvider } from "../src/Service/axiosClient";
// import { SignalRProvider } from "../src/Service/SignalRProvider";
// import AdminPostManagement from "./admin/views/AdminPostManagement";
// import Dashboard from "./admin/views/DashBoardView";
// import UserManagement from "./admin/views/UserManagement";
// import UserReport from "./admin/views/UserReportManagerView";
// import "./App.css";
// import AccountVerified from "./components/AccountVerified";
// import CommentModalBackGround from "./components/CommentModalBackgroud.";
// import { useAuth } from "./contexts/AuthContext";
// import { NotificationProvider } from "./contexts/NotificationContext";
// import { DeeplinkCommentModal } from "./stores/action/deepLinkAction";
// import ChatBotAIView from "./views/ChatBotAIView";
// import ForgotPass from "./views/ForgotPassword";
// import FriendProfileView from "./views/FriendProfileView";
// import FriendView from "./views/FriendView";
// import Homeview from "./views/HomeView";
// import Login from "./views/Login";
// import MessageView from "./views/MessageView";
// import Notifications from "./views/Notifications";
// import ProfileUserView from "./views/ProfileUserView";
// import Register from "./views/Register";
// import ResetForgotPassword from "./views/ResetForgotPassword";
// import ResultSearchView from "./views/ResultSearchView";
// import SearchView from "./views/SearchView";
// import SettingsView from "./views/SettingsView";
// import SharingRideView from "./views/SharingRideView";
// import TestDispatchAPI from "./views/TestDispatchAPI";
// import YourRideView from "./views/YourRideView";
// import Site404 from "./views/404Site";

// function App() {
//   const { isAuthenticated, userRole, isLoading } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const state = location.state;
//   const background = state && state.background;
//   const isSelectPostOpen = useSelector(
//     (state) => state.deeplink.isSelectPostOpen
//   );
//   const selectedPost = useSelector((state) => state.posts.selectedPost);
//   const error = useSelector((state) => state.deeplink.error);

//   useEffect(() => {
//     if (isLoading) return; // Chờ xác thực hoàn tất

//     // Chuyển hướng nếu đã đăng nhập và truy cập /login
//     if (isAuthenticated && location.pathname === "/login") {
//       if (userRole?.toLowerCase() === "admin") {
//         navigate("/admin/dashboard", { replace: true });
//       } else {
//         navigate("/home", { replace: true });
//       }
//     }

//     // Xử lý deeplink cho post
//     if (selectedPost) return;
//     const pathMatch = location.pathname.match(/^\/post\/(.+)$/);
//     if (pathMatch) {
//       const postId = pathMatch[1];
//       const uuidRegex =
//         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
//       if (!uuidRegex.test(postId)) {
//         console.error("postId không hợp lệ:", postId);
//         navigate("/home", { replace: true });
//         return;
//       }
//       if (isAuthenticated) {
//         dispatch(DeeplinkCommentModal(postId));
//       } else {
//         navigate("/login", { replace: true });
//       }
//     }
//   }, [
//     isAuthenticated,
//     userRole,
//     isLoading,
//     location.pathname,
//     dispatch,
//     navigate,
//   ]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error || "Không thể tải bài viết");
//     }
//   }, [error]);

//   // Hàm bảo vệ tuyến đường
//   const ProtectedRoute = ({ children, allowedRoles }) => {
//     if (isLoading) return null; // Chờ xác thực
//     if (!isAuthenticated) return <Navigate to="/login" replace />;
//     if (!allowedRoles.includes(userRole?.toLowerCase())) {
//       return userRole?.toLowerCase() === "admin" ? (
//         <Navigate to="/admin/dashboard" replace />
//       ) : (
//         <Navigate to="/home" replace />
//       );
//     }
//     return children;
//   };

//   return (
//     <>
//       <ToastContainer />
//       <NotificationProvider>
//         <AxiosConfigProvider />
//         <SignalRProvider>
//           <Routes location={background || location}>
//             {/* Tuyến đường không yêu cầu xác thực */}
//             <Route path="/" element={<Login />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/forgotpassword" element={<ForgotPass />} />
//             <Route path="/reset-password" element={<ResetForgotPassword />} />
//             <Route path="/resetFP" element={<ResetForgotPassword />} />
//             <Route path="/AccountVerified" element={<AccountVerified />} />

//             {/* Tuyến đường chỉ dành cho admin */}
//             <Route
//               path="/admin/dashboard"
//               element={
//                 <ProtectedRoute allowedRoles={["admin"]}>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin/userreport"
//               element={
//                 <ProtectedRoute allowedRoles={["admin"]}>
//                   <UserReport />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin/postmanager"
//               element={
//                 <ProtectedRoute allowedRoles={["admin"]}>
//                   <AdminPostManagement />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin/users"
//               element={
//                 <ProtectedRoute allowedRoles={["admin"]}>
//                   <UserManagement />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Tuyến đường chỉ dành cho user */}
//             <Route
//               path="/home"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <Homeview />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/search"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <SearchView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/sharing-ride"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <SharingRideView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/your-ride"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <YourRideView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/post/:id"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <Homeview />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/MessageView"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <MessageView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/ProfileUserView"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <ProfileUserView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/settings"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <SettingsView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/profile/:userId"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <FriendProfileView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/friend"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <FriendView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/ResultSearchView"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <ResultSearchView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/notify"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <Notifications />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/chatBoxAI/:conversationId?"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <ChatBotAIView />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/test"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <TestDispatchAPI />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/404Site"
//               element={
//                 <ProtectedRoute allowedRoles={["user"]}>
//                   <Site404 />
//                 </ProtectedRoute>
//               }
//             />

//             {/* Chuyển hướng mặc định */}
//             <Route
//               path="*"
//               element={
//                 isAuthenticated ? (
//                   userRole?.toLowerCase() === "admin" ? (
//                     <Navigate to="/admin/dashboard" replace />
//                   ) : (
//                     <Navigate to="/404Site" replace />
//                   )
//                 ) : (
//                   <Navigate to="/login" replace />
//                 )
//               }
//             />
//           </Routes>
//           {isAuthenticated && <CommentModalBackGround />}
//         </SignalRProvider>
//       </NotificationProvider>
//     </>
//   );
// }

// export default App;

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
import AdminPostManagement from "./admin/views/AdminPostManagement";
import FriendProfileView from "./views/FriendProfileView";
import SettingsView from "./views/SettingsView";

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

import TestDispatchAPI from "./views/TestDispatchAPI";

import UserManagement from "./admin/views/UserManagement";

import Site404 from "./views/404Site";
import NotificationAdmin from "./admin/views/NotificationManagement";

function App() {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  console.warn("Role người dùng>>", userRole);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const state = location.state;
  const background = state && state.background;
  const isSelectPostOpen = useSelector(
    (state) => state.deeplink.isSelectPostOpen
  );
  const selectedPost = useSelector((state) => state.posts.selectedPost);
  const error = useSelector((state) => state.deeplink.error);

  // useEffect(() => {
  //   if (isAuthenticated && location.pathname === "/login") {
  //     window.history.replaceState(null, "", "/home");
  //   }
  // }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    console.log("App useEffect:", {
      isAuthenticated,
      pathname: location.pathname,
      state: location.state,
    });
    // Chỉ chuyển hướng nếu đã đăng nhập, đang ở /login, và không phải từ đăng nhập
    if (
      isAuthenticated &&
      location.pathname === "/login" &&
      !location.state?.fromLogin
    ) {
      navigate("/home", { replace: true });
    }

    if (selectedPost) {
      return;
    }

    const pathMatch = location.pathname.match(/^\/post\/(.+)$/);
    if (pathMatch) {
      const postId = pathMatch[1];
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
            {!isAuthenticated && (
              <>
                {/* Route không cần xác thực */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPass />} />
                <Route
                  path="/reset-password"
                  element={<ResetForgotPassword />}
                />
                <Route path="/AccountVerified" element={<AccountVerified />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
            {/* Route dành cho admin */}
            {isAuthenticated && userRole.toLowerCase() === "admin" && (
              <>
               <Route
                  path="/admin/tripnotifications"
                  element={<NotificationAdmin />}
                />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/userreport" element={<UserReport />} />
                <Route
                  path="/admin/postmanager"
                  element={<AdminPostManagement />}
                />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/admin/users" element={<UserManagement />} />
                {/* Admin không thể truy cập vào route của user */}
                <Route
                  path="*"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </>
            )}

            {/* Route dành cho user */}
            {isAuthenticated && userRole.toLowerCase() === "user" && (
              <>
                <Route path="/home" element={<Homeview />} />
                <Route path="/search" element={<SearchView />} />
                <Route path="/sharing-ride" element={<SharingRideView />} />
                <Route path="/your-ride" element={<YourRideView />} />
                <Route path="/post/:id" element={<Homeview />} />
                <Route path="/MessageView" element={<MessageView />} />
                <Route path="/ProfileUserView" element={<ProfileUserView />} />
                <Route path="/settings" element={<SettingsView />} />
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
                <Route path="/test" element={<TestDispatchAPI />} />
                <Route path="/404Site" element={<Site404 />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            )}

            {/* Chuyển hướng mặc định */}
            <Route path="*" element={<Site404 />} />
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

// Có lỗi sẽ sử dụng lại cái này
{
  /* <Routes location={background || location}>
            {isAuthenticated && userRole === "Admin" && (
              <>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/userreport" element={<UserReport />} />
                <Route
                  path="/admin/postmanager"
                  element={<AdminPostManagement />}
                />
                <Route path="/admin/users" element={<UserManagement />} />

                <Route
                  path="*"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </>
            )}

            {isAuthenticated && userRole === "user" ? (
              <>
                <Route path="/home" element={<Homeview />} />
                <Route path="/search" element={<SearchView />} />
                <Route path="/sharing-ride" element={<SharingRideView />} />
                <Route path="/your-ride" element={<YourRideView />} />
                <Route path="/post/:id" element={<Homeview />} />
                <Route path="/MessageView" element={<MessageView />} />
                <Route path="/ProfileUserView" element={<ProfileUserView />} />

                <Route path="/settings" element={<SettingsView />} />

                <Route path="/admin/users" element={<UserManagement />} />

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
                <Route path="/test" element={<TestDispatchAPI />} />
                <Route path="/404Site" element={<Site404 />} />
                <Route path="*" element={<Navigate to="/404Site" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPass />} />
                <Route
                  path="/reset-password"
                  element={<ResetForgotPassword />}
                />
                <Route path="/resetFP" element={<ResetForgotPassword />} />
                <Route path="/AccountVerified" element={<AccountVerified />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes> */
}
