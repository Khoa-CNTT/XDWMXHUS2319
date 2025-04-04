import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { startAutoRefresh } from "./utils/RefeshToken";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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


import Notifications from "./views/Notifications";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const checkToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <>
      <Router>
        <Routes>

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
              <Route path="/sharing-ride" element={<SharingRideView />} />
              <Route path="/your-ride" element={<YourRideView />} />
              <Route path="/post/:id" element={<Homeview />} />
              <Route path="/MessageView" element={<MessageView />} />
              <Route path="/ProfileUserView" element={<ProfileUserView />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
              <Route path="/notify" element={<Notifications />} />
            </>
          )}

          
         
      

        </Routes>
      </Router>
      <ToastContainer></ToastContainer>
    </>
  );
}

export default App;
