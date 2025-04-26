import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchOtherUserProfile,
  userProfile,
} from "../stores/action/profileActions";
import { fetchFriendsByUserId } from "../stores/action/friendAction";
import { fetchPostsByOtherUser } from "../stores/action/listPostActions";
import ProfileFriendsHeader from "../components/ProfileUserComponent/ProfileFriendHeader";
import ProfilePhotos from "../components/ProfileUserComponent/ProfilePhotos";
import ProfileFriends from "../components/ProfileUserComponent/ProfileFriends";
import ProfileIntro from "../components/ProfileUserComponent/ProfileIntro";
import Header from "../components/HomeComponent/Header";
import AllPosts from "../components/HomeComponent/AllPostHome";
import PostInput from "../components/HomeComponent/PostInputHome";
import "../styles/ProfileView.scss";
import { fetchPostImagesPreview } from "../stores/action/profileActions";
import ProfileFriendsUserOther from "../components/ProfileUserComponent/ProfileFriendsUserOther";

const FriendProfileView = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.users.users) || {};
  // Get the other user's profile from state
  const otherUserProfile = useSelector((state) => state.users.otherUser) || {};
  const { post } = useSelector((state) => state.users);
  const [shouldFocusBio, setShouldFocusBio] = useState(false);
  const profileHeaderRef = useRef();

  const handleEditBioClick = () => {
    setShouldFocusBio(true);
    if (profileHeaderRef.current) {
      profileHeaderRef.current.openModal();
    }
  };
  useEffect(() => {
    dispatch(userProfile()); // Lấy thông tin user đăng nhập trước
    if (userId) {
      dispatch(fetchPostImagesPreview(userId));
      dispatch(fetchOtherUserProfile(userId)); // Sau đó lấy thông tin người khác
      dispatch(fetchPostsByOtherUser(userId));
      dispatch(fetchFriendsByUserId(userId));
    }
  }, [dispatch, userId]);

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
          userData={otherUserProfile} // Pass the specific user data
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
            </div>
          </div>
          <div className="profile-user-view__right">
            <AllPosts
              usersProfile={otherUserProfile}
              post={post}
              showOwnerPosts={true}
              isFriendProfile={true}
              userFriendId={userId} // Pass the userId to fetch posts for this user
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendProfileView;
