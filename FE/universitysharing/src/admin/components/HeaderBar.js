import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "antd";
import { BellOutlined } from "@ant-design/icons";
import avatarDefault from "../../assets/AvatarDefaultFill.png";
import "../styles/DashBoard.scss";
import SettingModal from "./SettingModal";
import { userProfile } from "../../stores/action/profileActions";
import { useDispatch, useSelector } from "react-redux";

const { Header } = Layout;

const AppHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleToggleModal = (callback) => {
    setIsModalOpen((prev) => {
      const nextState = !prev;
      // Gọi callback khi modal mở/đóng xong
      if (typeof callback === "function") {
        callback(nextState);
      }
      return nextState;
    });
  };

  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);
  return (
    <>
      <Header
        style={{ backgroundColor: "#1890ff", padding: "0 20px", color: "#fff" }}
      >
        <div className="header-content">
          <BellOutlined style={{ fontSize: 20, color: "white" }} />

          <div className="Avatar-admin" onClick={handleToggleModal}>
            <img src={users?.profilePicture || avatarDefault}></img>
          </div>
        </div>
      </Header>

      {/* Setting Modal */}
      <SettingModal
        isOpen={isModalOpen}
        onClose={handleToggleModal}
        UserProfile={users}
        users={users}
      />
    </>
  );
};

export default AppHeader;
