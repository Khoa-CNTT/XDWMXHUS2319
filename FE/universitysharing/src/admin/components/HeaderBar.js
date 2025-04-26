import React from "react";
import { Layout } from "antd";
import { BellOutlined } from "@ant-design/icons";
import avatarDefault from "../../assets/AvatarDefaultFill.png";
import "../styles/DashBoard.scss";

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header
      style={{ backgroundColor: "#1890ff", padding: "0 20px", color: "#fff" }}
    >
      <div className="header-content">
        <BellOutlined style={{ fontSize: 20, color: "white" }} />

        <div className="Avatar-admin">
          <img src={avatarDefault}></img>
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
