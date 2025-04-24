import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BellOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import logoWeb from "../../assets/Logo white.png";

const { Sider } = Layout;

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map route path với key tương ứng
  const pathToKey = {
    "/admin/dashboard": "1",
    "/admin/users": "2",
    "/admin/userreport": "3",
    "/admin/posts": "4",
  };

  // Lấy key tương ứng với route hiện tại
  const selectedKey = pathToKey[location.pathname] || "1";

  return (
    <Sider
      width={200}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        paddingTop: "20px",
      }}
    >
      <div className="logo" style={{ color: "white", textAlign: "center" }}>
        <img src={logoWeb} style={{ width: "100px" }} alt="logo" />
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
        <Menu.Item
          key="1"
          icon={<DashboardOutlined />}
          onClick={() => navigate("/admin/dashboard")}
        >
          <Tooltip title="DashBoard" placement="right">
            <span>DashBoard</span>
          </Tooltip>
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<UserOutlined />}
          // onClick={() => navigate("/admin/users")}
        >
          <Tooltip title="Quản lý người dùng" placement="right">
            <span>Quản lý người dùng</span>
          </Tooltip>
        </Menu.Item>
        <Menu.Item
          key="3"
          icon={<BellOutlined />}
          onClick={() => navigate("/admin/userreport")}
        >
          <Tooltip title="Báo cáo từ người dùng" placement="right">
            <span>Báo cáo từ người dùng</span>
          </Tooltip>
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<FileTextOutlined />}
          // onClick={() => navigate("/admin/posts")}
        >
          <Tooltip title="Quản lý bài viết" placement="right">
            <span>Quản lý bài viết</span>
          </Tooltip>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSidebar;
