import React, { useState, useEffect, useRef } from "react";
import ProfileHeader from "../components/ProfileUserComponent/ProfileHeader";
import ProfilePhotos from "../components/ProfileUserComponent/ProfilePhotos";
import ProfileFriends from "../components/ProfileUserComponent/ProfileFriends";
import ProfileIntro from "../components/ProfileUserComponent/ProfileIntro";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/ProfileView.scss";
import AllPosts from "../components/HomeComponent/AllPostHome";
import { fetchPostsByOwner } from "../stores/action/listPostActions";
import PostInput from "../components/HomeComponent/PostInputHome";

const ProfileUserView = () => {
  const dispatch = useDispatch();
  const { post } = useSelector((state) => state.users);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  // Thêm state và ref
  const [shouldFocusBio, setShouldFocusBio] = useState(false);
  const profileHeaderRef = useRef();

  const handleEditBioClick = () => {
    setShouldFocusBio(true);
    // Gọi hàm mở modal từ ProfileHeader
    if (profileHeaderRef.current) {
      profileHeaderRef.current.openModal();
    }
  };

  useEffect(() => {
    dispatch(userProfile()); // Lấy thông tin user
    dispatch(fetchPostsByOwner()); // Sử dụng action mới
  }, [dispatch]);

  return (
    <div className="profile-user-view">
      <Header className="header" usersProfile={users} />
      <ProfileHeader
        ref={profileHeaderRef}
        shouldFocusBio={shouldFocusBio}
        onModalOpened={() => setShouldFocusBio(false)}
      />
      <div className="profile-user-view__content">
        <div className="left-sidebar-container">
          <div className="left-sidebar-content">
            <ProfileIntro
              usersProfile={users}
              onEditBioClick={handleEditBioClick}
            />
            <ProfilePhotos usersProfile={users} />
            <ProfileFriends usersProfile={users} />
          </div>
        </div>
        <div className="profile-user-view__right">
          <PostInput className="post-input" usersProfile={users} />
          <AllPosts usersProfile={users} post={post} showOwnerPosts={true} />
        </div>
      </div>
    </div>
  );
};

export default ProfileUserView;
