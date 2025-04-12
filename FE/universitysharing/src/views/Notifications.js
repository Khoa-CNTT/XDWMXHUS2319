import React from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";
import Allnotify from "../components/NotifyComponent/AllNotify";

const Notifications = () => {
  return (
    <div className="home-view">
      <Header className="header" />
      <div className="main-content">
        <div className="left-sidebar">
          <LeftSidebar />
          <FooterHome className="footer" /> {/* Footer chuyển vào đây */}
        </div>
        <div className="center-content">
      <Allnotify></Allnotify>
        </div>
        <RightSidebar className="right-sidebar" />
      </div>
    </div>
  );
};

export default Notifications;
