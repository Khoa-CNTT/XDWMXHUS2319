
import "./App.css";
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
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
import FriendProfileView from "./views/FriendProfileView";
import getUserIdFromToken from "./utils/JwtDecode";

import CommentModalBackGround from "./components/CommentModalBackgroud.";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SignalRProvider } from "../src/Service/SignalRProvider"; // Thay useSignalRManager
import { useAuth } from "./contexts/AuthContext";
import { AxiosConfigProvider } from "../src/Service/axiosClient";

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
        <SignalRProvider> {/* Bao quanh routes để cung cấp context */}
          <Routes location={background || location}>
            {isAuthenticated ? (
              <>
                <Route path="/home" element={<Homeview />} />
                <Route path="/search" element={<SearchView />} />
                <Route path="/sharing-ride" element={<SharingRideView />} />
                <Route path="/your-ride" element={<YourRideView />} />
                <Route path="/post/:id" element={<Homeview />} />
                <Route path="/MessageView" element={<MessageView />} />
                <Route path="/ProfileUserView" element={<ProfileUserView />} />
                <Route path="/profile/:userId" element={<FriendProfileView />} />
                <Route path="/ResultSearchView" element={<ResultSearchView />} />
                <Route path="/notify" element={<Notifications />} />
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