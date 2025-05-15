import React, { useState, useEffect } from "react";
import { Layout, Table, Tag, Typography, Spin, Alert } from "antd";
import axios from "axios";
import moment from "moment";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";

const { Title } = Typography;
const { Header, Content } = Layout;

const NotificationAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://localhost:7053/api/report/admin/ride-reports"
        );
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        setError("Không thể tải thông báo. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <span>{text.slice(0, 8)}...</span>,
    },
    {
      title: "Ride ID",
      dataIndex: "rideId",
      key: "rideId",
      render: (text) => <span>{text.slice(0, 8)}...</span>,
    },
    {
      title: "Passenger ID",
      dataIndex: "passengerId",
      key: "passengerId",
      render: (text) => <span>{text.slice(0, 8)}...</span>,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Số điện thoại hành khách",
      dataIndex: "phonePassenger",
      key: "phonePassenger",
      render: (text) => <span>{text || "Không có"}</span>,
    },
    {
      title: "Số điện thoại người thân",
      dataIndex: "relativePhonePassenger",
      key: "relativePhonePassenger",
      render: (text) => <span>{text || "Không có"}</span>,
    },
    {
      title: "Loại cảnh báo",
      dataIndex: "alertType",
      key: "alertType",
      render: (type) => (
        <Tag color={type === 0 ? "red" : "orange"}>
          {type === 0 ? "Nghiêm trọng" : "Cảnh báo"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Đã xử lý" : "Chưa xử lý"}
        </Tag>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
            height: 64,
            lineHeight: "64px",
          }}
        >
          <AppHeader />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
            marginLeft: 200, // Để tránh bị che bởi AppSidebar cố định
          }}
        >
          <Title level={2}>Thông báo chuyến đi</Title>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}
          {loading ? (
            <Spin
              size="large"
              style={{ display: "block", margin: "50px auto" }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={notifications}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default NotificationAdmin;
