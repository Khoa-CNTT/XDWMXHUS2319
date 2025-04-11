import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { startAutoRefresh } from "./utils/RefeshToken";
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
import AccountVerified from "../src/components/AccountVerified";
import SearchView from "./views/SearchView";
import ResultSearchView from "./views/ResultSearchView";

import Notifications from "./views/Notifications";

import getUserIdFromToken from "./utils/JwtDecode";
import commentModalBackGround from "./components/CommentModalBackgroud.";
import CommentModalBackGround from "./components/CommentModalBackgroud.";

function App() {
  const location = useLocation();
  const state = location.state;

  const background = state && state.background;
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Kiểm tra token khi người dùng truy cập ứng dụng
  useEffect(() => {
    const checkTokenValidity = () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        setToken(null); // Nếu token không hợp lệ hoặc hết hạn, set token là null
      } else {
        setToken(localStorage.getItem("token")); // Token hợp lệ
      }
    };

    checkTokenValidity(); // Gọi hàm kiểm tra token khi vừa vào ứng dụng

    // Cập nhật token khi localStorage thay đổi
    const checkToken = () => {
      checkTokenValidity();
    };

    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <>
      {/* <Router> */}
      <Routes location={background || location}>
        {!token ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPass />} />
            <Route path="/resetFP" element={<ResetForgotPassword />} />
            <Route path="/AccountVerified" element={<AccountVerified />} />
          </>
        ) : (
          <>
            <Route path="/home" element={<Homeview />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/sharing-ride" element={<SharingRideView />} />
            <Route path="/your-ride" element={<YourRideView />} />
            <Route path="/post/:id" element={<Homeview />} />
            <Route path="/MessageView" element={<MessageView />} />
            <Route path="/ProfileUserView" element={<ProfileUserView />} />
            <Route path="*" element={<Navigate to="/home" replace />} />

            <Route path="/ResultSearchView" element={<ResultSearchView />} />

            <Route path="/notify" element={<Notifications />} />
          </>
        )}
      </Routes>
      {/* </Router> */}
      {background && (
        <Routes>
          <Route path="/post/:id" element={<CommentModalBackGround />} />
        </Routes>
      )}

      <ToastContainer></ToastContainer>
    </>
  );
}

export default App;
