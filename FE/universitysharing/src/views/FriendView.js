import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";
import "../styles/MoblieReponsive/HomeViewMobile/HomeMobile.scss";
import "../styles/FriendViews/FriendView.scss";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import {
  useSwipeToOpenSidebar,
  useBackButtonToCloseSidebar,
} from "../utils/OpenMenuLeftisdebar";
import { RiArrowRightDoubleFill } from "react-icons/ri";

import FriendRequests from "../components/FriendComponent/FriendRequest";
import Friendly from "../components/FriendComponent/Friendly";
const FriendView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
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
          <div className="friend-tab-buttons">
            <button
              className={activeTab === "requests" ? "active" : ""}
              onClick={() => setActiveTab("requests")}
            >
              Lời mời kết bạn
            </button>
            <button
              className={activeTab === "friends" ? "active" : ""}
              onClick={() => setActiveTab("friends")}
            >
              Bạn bè
            </button>
          </div>
          {activeTab === "requests" ? <FriendRequests /> : <Friendly />}
        </div>
        {/* <RightSidebar className="right-sidebar" /> */}
      </div>
    </div>
  );
};

export default FriendView;
