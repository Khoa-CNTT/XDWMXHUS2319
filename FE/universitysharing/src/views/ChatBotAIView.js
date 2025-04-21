import React, { useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import Footer from "../components/HomeComponent/FooterHome";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import ChatBoxAI from "../components/ChatAIComponent/ChatAI"; // Đổi từ ChatBot sang ChatBoxAI

import "../styles/HomeView.scss";
import "../styles/ChatAI/ChatBoxAI.scss"; // Thêm import SCSS
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";

const ChatBotAIView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  return (
    <div className="home-view">
      <Header className="header" usersProfile={users} />
      <div className="main-content">
        <div className="left-sidebar">
          <LeftSidebar usersProfile={users} />
        </div>
        <div className="center-content">
          <ChatBoxAI /> {/* Sử dụng component ChatBoxAI */}
        </div>
        <div className="right-sidebar">
          <RightSidebar />
          <Footer className="footer" />
        </div>
      </div>
    </div>
  );
};

export default ChatBotAIView;