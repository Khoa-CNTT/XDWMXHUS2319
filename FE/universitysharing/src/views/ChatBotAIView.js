import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import AllPostHome from "../components/HomeComponent/AllPostHome";
import PostInputHome from "../components/HomeComponent/PostInputHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";
import "../styles/ChatAI/ChatBotAIView.scss";
import "../styles/MoblieReponsive/HomeViewMobile/HomeMobile.scss";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import {
  useSwipeToOpenSidebar,
  useBackButtonToCloseSidebar,
} from "../utils/OpenMenuLeftisdebar";
import {
  RiArrowLeftDoubleFill,
  RiArrowRightDoubleFill,
  RiLeafFill,
} from "react-icons/ri";
import ChatLayout from "../components/ChatAIComponent/ChatLayout";
const ChatBotAIView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const [showSidebar, setShowSidebar] = useState(false);

  const { users } = usersState;
  // console.log("Thong tin user>>>", users);

  //đóng mở left side bar
  useSwipeToOpenSidebar(setShowSidebar);
  useBackButtonToCloseSidebar(showSidebar, setShowSidebar);
  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  return (
    <div className="home-view">
      <Header className="header" usersProfile={users} />
      <div className="main-content">
        <div
          className={`left-sidebar-overlay ${showSidebar ? "show" : ""}`}
          onClick={() => setShowSidebar(false)}
        />
        <div className={`left-sidebar ${showSidebar ? "show" : ""}`}>
          <LeftSidebar usersProfile={users} />
          <FooterHome />
        </div>
        <div
          className={`Open-menu ${showSidebar ? "move-right" : ""}`}
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <RiArrowRightDoubleFill
            className={`Open-menu-icon ${showSidebar ? "rotate" : ""}`}
          />
        </div>
        <div className="center-content">
          <div className="chat-ai-container">
            <ChatLayout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotAIView;
