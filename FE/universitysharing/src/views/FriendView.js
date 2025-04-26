import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFriendsWithCursor,
  fetchReceivedRequestsWithCursor,
  fetchSentRequestsWithCursor,
} from "../stores/action/friendAction";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import FriendRequestsReceived from "../components/FriendComponent/FriendRequestReceived";
import FriendRequestsSent from "../components/FriendComponent/FriendRequestSent";
import Friendly from "../components/FriendComponent/Friendly";
import {
  useSwipeToOpenSidebar,
  useBackButtonToCloseSidebar,
} from "../utils/OpenMenuLeftisdebar";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import "../styles/HomeView.scss";
import "../styles/MoblieReponsive/HomeViewMobile/HomeMobile.scss";
import "../styles/FriendViews/FriendView.scss";
import { userProfile } from "../stores/action/profileActions";

const FriendView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  const { listFriendsCursor, listFriendReceivedCursor, listFriendsSentCursor } =
    useSelector((state) => state.friends || {});
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);
  // Fetch data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "friends":
        dispatch(fetchFriendsWithCursor());
        break;
      case "requests-received":
        dispatch(fetchReceivedRequestsWithCursor());
        break;
      case "requests-sent":
        dispatch(fetchSentRequestsWithCursor());
        break;
      default:
        break;
    }
  }, [activeTab, dispatch]);

  // Handle pagination
  const handleLoadMore = () => {
    switch (activeTab) {
      case "friends":
        if (listFriendsCursor.nextCursor) {
          dispatch(fetchFriendsWithCursor(listFriendsCursor.nextCursor));
        }
        break;
      case "requests-received":
        if (listFriendReceivedCursor.nextCursor) {
          dispatch(
            fetchReceivedRequestsWithCursor(listFriendReceivedCursor.nextCursor)
          );
        }
        break;
      case "requests-sent":
        if (listFriendsSentCursor.nextCursor) {
          dispatch(
            fetchSentRequestsWithCursor(listFriendsSentCursor.nextCursor)
          );
        }
        break;
      default:
        break;
    }
  };

  // Sidebar controls
  useSwipeToOpenSidebar(setShowSidebar);
  useBackButtonToCloseSidebar(showSidebar, setShowSidebar);

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
              className={activeTab === "requests-received" ? "active" : ""}
              onClick={() => setActiveTab("requests-received")}
            >
              Lời mời kết bạn
            </button>
            <button
              className={activeTab === "friends" ? "active" : ""}
              onClick={() => setActiveTab("friends")}
            >
              Bạn bè
            </button>
            <button
              className={activeTab === "requests-sent" ? "active" : ""}
              onClick={() => setActiveTab("requests-sent")}
            >
              Lời mời đi
            </button>
          </div>

          {activeTab === "requests-received" && (
            <FriendRequestsReceived
              requests={listFriendReceivedCursor.data || []}
              onLoadMore={handleLoadMore}
              hasMore={!!listFriendReceivedCursor.nextCursor}
              loading={listFriendReceivedCursor.loading}
              error={listFriendReceivedCursor.error}
            />
          )}
          {activeTab === "friends" && (
            <Friendly
              friends={listFriendsCursor.data || []}
              onLoadMore={handleLoadMore}
              hasMore={!!listFriendsCursor.nextCursor}
              loading={listFriendsCursor.loading}
              error={listFriendsCursor.error}
            />
          )}
          {activeTab === "requests-sent" && (
            <FriendRequestsSent
              requests={listFriendsSentCursor.data || []}
              onLoadMore={handleLoadMore}
              hasMore={!!listFriendsSentCursor.nextCursor}
              loading={listFriendsSentCursor.loading}
              error={listFriendsSentCursor.error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendView;
