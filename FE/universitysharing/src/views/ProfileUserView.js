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

const ProfileUserView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  return (
    <div className="profile-user-view">
      <Header className="header" usersProfile={users} />
      <ProfileHeader />
      <div className="profile-user-view__content">
        <div className="profile-user-view__left">
          <ProfileIntro />
          <ProfilePhotos />
          <ProfileFriends />
        </div>
        <div className="profile-user-view__right">
          <ProfilePost />
        </div>
      </div>
    </div>
  );
};

export default ProfileUserView;
