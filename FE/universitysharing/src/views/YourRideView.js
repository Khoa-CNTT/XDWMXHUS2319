import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import Footer from "../components/HomeComponent/FooterHome";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import InputCreateRide from "../components/RideComponent/InputCreateRide";
import YourRide from "../components/RideComponent/YourRIde";
import "../styles/HomeView.scss";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
const SharingRideView = () => {
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
          <LeftSidebar />
          <Footer className="footer" />
        </div>
        <div className="center-content">
          <InputCreateRide className="post-input" />
          <YourRide className="all-posts" />
        </div>
        <RightSidebar className="right-sidebar" />
      </div>
    </div>
  );
};

export default SharingRideView;
