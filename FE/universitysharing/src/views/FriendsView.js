import React, { useState, useEffect } from "react";
import SidebarFriend from "../components/FriendComponent/SidebarFriend";
import FriendRequestItem from "../components/FriendComponent/FriendRequestItem";
import "../styles/FriendView/FriendsView.scss";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import avatarDefault from "../assets/AvatarDefault.png";

const FriendsView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const [activeTab, setActiveTab] = useState("friend-requests");

  const { users } = usersState;
  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  // Dữ liệu mẫu (có thể thay thế bằng dữ liệu từ API)
  const friendRequests = [
    {
      id: 1,
      name: "Obito",
      mutualFriends: 0,
      avatar: avatarDefault,
    },
    {
      id: 2,
      name: "David nộp",
      mutualFriends: 0,
      avatar: avatarDefault,
    },
    {
      id: 3,
      name: "Nghiêm tổng",
      mutualFriends: 0,
      avatar: avatarDefault,
    },
    {
      id: 4,
      name: "Lý lữ ca",
      mutualFriends: 0,
      avatar: avatarDefault,
    },
    {
      id: 5,
      name: "Mã sơn hậu nguyên",
      mutualFriends: 0,
      avatar: avatarDefault,
    },
  ];

  return (
    <div className="friends-view-container">
      <Header className="header" usersProfile={users} />
      <div className="friends-view">
        <SidebarFriend activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="friends-content">
          {activeTab === "friend-requests" && (
            <>
              <h2 className="friends-title">Lời mời kết bạn</h2>
              <div className="friend-request-list">
                {friendRequests.map((request) => (
                  <FriendRequestItem key={request.id} request={request} />
                ))}
              </div>
            </>
          )}
          {activeTab === "suggestions" && (
            <div>
              <h2 className="friends-title">Gợi ý</h2>
              <p>Chưa có gợi ý bạn bè.</p>
            </div>
          )}
          {activeTab === "all-friends" && (
            <div>
              <h2 className="friends-title">Tất cả bạn bè</h2>
              <p>Chưa có danh sách bạn bè.</p>
            </div>
          )}
          {activeTab === "birthdays" && (
            <div>
              <h2 className="friends-title">Sinh nhật</h2>
              <p>Chưa có sinh nhật nào sắp tới.</p>
            </div>
          )}
          {activeTab === "custom-lists" && (
            <div>
              <h2 className="friends-title">Danh sách tùy chỉnh</h2>
              <p>Chưa có danh sách tùy chỉnh.</p>
            </div>
          )}
          {activeTab === "home" && (
            <div>
              <h2 className="friends-title">Trang chủ</h2>
              <p>Chuyển hướng về trang chủ.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsView;
