import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import AllPostHome from "../components/HomeComponent/AllPostHome";
import PostInputHome from "../components/HomeComponent/PostInputHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";

const HomeView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  // console.log("Thong tin user>>>", users);

  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);
  return (
    <div className="home-view">
      <Header className="header" usersProfile={users} />
      <div className="main-content">
        <div className="left-sidebar">
          <LeftSidebar usersProfile={users} />
          <FooterHome className="footer" /> {/* Footer chuyển vào đây */}
        </div>
        <div className="center-content">
          <PostInputHome className="post-input" usersProfile={users} />
          <AllPostHome className="all-posts" usersProfile={users} />
        </div>
        <RightSidebar className="right-sidebar" />
      </div>
    </div>
  );
};

export default HomeView;
