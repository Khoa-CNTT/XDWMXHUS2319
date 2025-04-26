import React, { useState, useEffect, useRef } from "react";
import ProfileHeader from "../components/ProfileUserComponent/ProfileHeader";
import ProfilePhotos from "../components/ProfileUserComponent/ProfilePhotos";
import ProfileFriends from "../components/ProfileUserComponent/ProfileFriends";
import ProfileIntro from "../components/ProfileUserComponent/ProfileIntro";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/ProfileView.scss";
import "../styles/MoblieReponsive/UsersProfileMoblie/ProfileViewMobile.scss";
import AllPosts from "../components/HomeComponent/AllPostHome";
import { fetchPostsByOwner } from "../stores/action/listPostActions";
import PostInput from "../components/HomeComponent/PostInputHome";
import { fetchListFriend } from "../stores/action/friendAction";
import getUserIdFromToken from "../utils/JwtDecode";
import { fetchPostImagesPreview } from "../stores/action/profileActions";

const ProfileUserView = () => {
  const dispatch = useDispatch();
  const { post } = useSelector((state) => state.users);
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  const { listFriend } = useSelector((state) => state.listFriends) || {};
  // Thêm state và ref
  const [shouldFocusBio, setShouldFocusBio] = useState(false);
  const profileHeaderRef = useRef();
  const userId = getUserIdFromToken();

  const handleEditBioClick = () => {
    setShouldFocusBio(true);
    // Gọi hàm mở modal từ ProfileHeader
    if (profileHeaderRef.current) {
      profileHeaderRef.current.openModal();
    }
  };

  useEffect(() => {
    dispatch(userProfile()); // Lấy thông tin user
    dispatch(fetchPostImagesPreview(userId));
    dispatch(fetchListFriend()); // Lấy danh sách bạn bè
    dispatch(fetchPostsByOwner()); // Sử dụng action mới
  }, [dispatch]);

  return (
    <>
      <div className="home-vieww">
        <Header className="header" usersProfile={users} />
      </div>
      <div className="profile-user-view">
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
    </>
  );
};

export default ProfileUserView;
