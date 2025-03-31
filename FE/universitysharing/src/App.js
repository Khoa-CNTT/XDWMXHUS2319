import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import { startAutoRefresh } from "./utils/RefeshToken";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./views/Login";
import Register from "./views/Register";
import ForgotPass from "./views/ForgotPassword";
import ResetForgotPassword from "./views/ResetForgotPassword";
import Homeview from "./views/HomeView";

import SharingRideView from "./views/SharingRideView";

import MessageView from "./views/MessageView";
import ProfileUserView from "./views/ProfileUserView";
import AccountVerified from "../src/components/AccountVerified";


function App() {
  // useEffect(() => {
  //   startAutoRefresh(); //Auto chạy refeshToken
  // }, []);
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Homeview />} />
          <Route path="/sharing-ride" element={<SharingRideView />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPass />} />
          <Route path="/resetFP" element={<ResetForgotPassword />} />
          <Route path="/post/:id" element={<Homeview />} />
          <Route path="*" element={<Login />} />
          <Route path="/MessageView" element={<MessageView />} />
          <Route path="/AccountVerified" element={<AccountVerified />} />
          <Route path="/ProfileUserView" element={<ProfileUserView />} />
        </Routes>
      </Router>
      <ToastContainer></ToastContainer>
    </>
  );
}

export default App;
