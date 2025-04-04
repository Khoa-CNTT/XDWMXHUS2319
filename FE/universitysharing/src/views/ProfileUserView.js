import React, { useState } from "react";
import ProfileHeader from "../components/ProfileUserComponent/ProfileHeader";
import ProfilePhotos from "../components/ProfileUserComponent/ProfilePhotos";
import ProfileFriends from "../components/ProfileUserComponent/ProfileFriends";
import ProfileIntro from "../components/ProfileUserComponent/ProfileIntro";
import ProfilePost from "../components/ProfileUserComponent/ProfilePost";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/ProfileView.scss";
import AllPosts from "../components/HomeComponent/AllPostHome";
import { getPostOwner } from "../stores/action/profileActions";
import PostInput from "../components/HomeComponent/PostInputHome";

const ProfileUserView = () => {
  const dispatch = useDispatch();
  const { post } = useSelector((state) => state.users);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  return (
    <div className="profile-user-view">
      <Header className="header" usersProfile={users} />
      <ProfileHeader />
      <div className="profile-user-view__content">
        <div className="left-sidebar-container">
          <div className="left-sidebar-content">
            <ProfileIntro />
            <ProfilePhotos />
            <ProfileFriends />
          </div>
        </div>
        <div className="profile-user-view__right">
          <PostInput className="post-input" usersProfile={users} />
          <AllPosts usersProfile={users} post={post} />
        </div>
      </div>
    </div>
  );
};

export default ProfileUserView;
