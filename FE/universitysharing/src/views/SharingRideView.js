import React, { useState, useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import Footer from "../components/HomeComponent/FooterHome";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import RightSidebar from "../components/HomeComponent/RightSideBarHome";
import InputCreateRide from "../components/RideComponent/InputCreateRide";
import AllSharingRide from "../components/RideComponent/AllSharingRidePost";
import AllRideRatings from "../components/RideComponent/AllRideRatings";
import "../styles/HomeView.scss";
import "../styles/RideViews/TabsSharingRideView.scss";
import "../styles/MoblieReponsive/HomeViewMobile/HomeMobile.scss";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import {
  useSwipeToOpenSidebar,
  useBackButtonToCloseSidebar,
} from "../utils/OpenMenuLeftisdebar";
import { RiArrowRightDoubleFill } from "react-icons/ri";

const SharingRideView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("sharing");
  const { users } = usersState;

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
          <Footer />
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
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "sharing" ? "active" : ""}`}
              onClick={() => setActiveTab("sharing")}
            >
              Tất cả bài chia sẻ xe
            </button>
            <button
              className={`tab ${activeTab === "ratings" ? "active" : ""}`}
              onClick={() => setActiveTab("ratings")}
            >
              Tất cả đánh giá
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "sharing" && (
            <>
              <InputCreateRide className="post-input" usersProfile={users} />
              <AllSharingRide className="all-posts" />
            </>
          )}
          {activeTab === "ratings" && <AllRideRatings className="all-posts" />}
        </div>
        <RightSidebar className="right-sidebar" />
      </div>
    </div>
  );
};

export default SharingRideView;
