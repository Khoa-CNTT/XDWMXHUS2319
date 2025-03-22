import React from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import AllPostHome from "../components/HomeComponent/AllPostHome";
import PostInputHome from "../components/HomeComponent/PostInputHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";

const HomeView = () => {
  return (
    <div className="home-view">
      <Header className="header" />
      <div className="main-content">
        <div className="left-sidebar">
          <LeftSidebar />
          <FooterHome className="footer" /> {/* Footer chuyển vào đây */}
        </div>
        <div className="center-content">
          <PostInputHome className="post-input" />
          <AllPostHome className="all-posts" />
        </div>
        <RightSidebar className="right-sidebar" />
      </div>
    </div>
  );
};

export default HomeView;
