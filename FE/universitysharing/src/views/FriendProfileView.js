import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom"; // Add useLocation
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOtherUserProfile,
  userProfile,
  fetchPostImagesPreview,
} from "../stores/action/profileActions";
import { fetchFriendsByUserId } from "../stores/action/friendAction";
import { fetchPostsByOtherUser } from "../stores/action/listPostActions";
import { fetchCompletedRidesWithRating } from "../stores/action/ridePostAction";
import ProfileFriendsHeader from "../components/ProfileUserComponent/ProfileFriendHeader";
import ProfilePhotos from "../components/ProfileUserComponent/ProfilePhotos";
import ProfileIntro from "../components/ProfileUserComponent/ProfileIntro";
import Header from "../components/HomeComponent/Header";
import AllPosts from "../components/HomeComponent/AllPostHome";
import AllRideRatings from "../components/RideComponent/AllRideRatings";
import "../styles/ProfileView.scss";
import ProfileFriendsUserOther from "../components/ProfileUserComponent/ProfileFriendsUserOther";
import FooterHome from "../components/HomeComponent/FooterHome";

const FriendProfileView = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const location = useLocation(); // Get navigation state

  const currentUser = useSelector((state) => state.users.users) || {};
  const otherUserProfile = useSelector((state) => state.users.otherUser) || {};
  const { post } = useSelector((state) => state.users);
  const completedRidesWithRating = useSelector(
    (state) => state.rides.completedRidesWithRating
  );
  const [activeTab, setActiveTab] = useState("posts"); // Default tab
  const [shouldFocusBio, setShouldFocusBio] = useState(false);
  const profileHeaderRef = useRef();

  const handleEditBioClick = () => {
    setShouldFocusBio(true);
    if (profileHeaderRef.current) {
      profileHeaderRef.current.openModal();
    }
  };

  useEffect(() => {
    dispatch(userProfile()); // Fetch current user profile
    if (userId) {
      dispatch(fetchPostImagesPreview(userId));
      dispatch(fetchOtherUserProfile(userId));
      dispatch(fetchPostsByOtherUser(userId));
      dispatch(fetchFriendsByUserId(userId));
      dispatch(fetchCompletedRidesWithRating(userId)); // Fetch ride ratings
    }
  }, [dispatch, userId]);

  // Set activeTab from navigation state if provided
  useEffect(() => {
    if (location.state?.activeTab === "ratings") {
      setActiveTab("ratings");
    }
  }, [location.state]);

  return (
    <>
      <div className="home-vieww">
        <Header className="header" usersProfile={currentUser} />
      </div>
      <div className="profile-user-view">
        <ProfileFriendsHeader
          ref={profileHeaderRef}
          shouldFocusBio={shouldFocusBio}
          onModalOpened={() => setShouldFocusBio(false)}
          isFriendProfile={true}
          userData={otherUserProfile}
          usersProfile={currentUser}
        />
        <div className="profile-user-view__content">
          <div className="left-sidebar-container">
            <div className="left-sidebar-content">
              <ProfileIntro
                usersProfile={otherUserProfile}
                onEditBioClick={handleEditBioClick}
                isFriendProfile={true}
              />
              <ProfilePhotos
                usersProfile={otherUserProfile}
                isFriendProfile={true}
              />
              <ProfileFriendsUserOther usersProfile={otherUserProfile} />
              <FooterHome />
            </div>
          </div>
          <div className="profile-user-view__right">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "posts" ? "active" : ""}`}
                onClick={() => setActiveTab("posts")}
              >
                Tất cả bài viết
              </button>
              <button
                className={`tab ${activeTab === "ratings" ? "active" : ""}`}
                onClick={() => setActiveTab("ratings")}
              >
                Tất cả bài đánh giá chuyến đi
              </button>
            </div>
            {activeTab === "posts" && (
              <AllPosts
                usersProfile={otherUserProfile}
                post={post}
                showOwnerPosts={true}
                isFriendProfile={true}
                userFriendId={userId}
              />
            )}
            {activeTab === "ratings" && (
              <AllRideRatings className="all-posts" driverId={userId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendProfileView;
