import React, { useEffect } from "react";
import { Layout, Card, Row, Col, Table, Typography, Divider, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardOverview,
  fetchUserStats,
  fetchReportStats,
  fetchRecentPosts,
} from "../../stores/action/dashboardActions";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";
import GrowthChart from "../components/DashBoard/GrowthChart";
import UserPieChart from "../components/DashBoard/PieChart";
import { toast } from "react-toastify";

const { Content } = Layout;
const { Title } = Typography;

const columns = [
  { title: "Người dùng", dataIndex: "user", key: "user" },
  { title: "Nội dung bài viết", dataIndex: "content", key: "content" },
  { title: "Trạng thái bài viết", dataIndex: "status", key: "status" },
  { title: "Lượt thích", dataIndex: "likes", key: "likes" },
  { title: "Lượt bình luận", dataIndex: "comments", key: "comments" },
  { title: "Lượt chia sẻ", dataIndex: "shares", key: "shares" },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { overview, recentPosts, loading, error } = useSelector(
    (state) => state.dashboard
  );

  // Gọi API khi component mount
  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchUserStats());
    dispatch(fetchReportStats());
    dispatch(fetchRecentPosts());
  }, [dispatch]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={{ marginLeft: 200 }}>
        <AppHeader />
        <Content style={{ margin: "20px" }}>
          <Title level={3}>DashBoard</Title>
          {loading ? (
            <div style={{ textAlign: "center", margin: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={6}>
                  <Card title="Tổng số người dùng">
                    <Title level={4} style={{ color: "green" }}>
                      {overview.totalUsers.toLocaleString()}
                    </Title>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Người dùng bị khóa">
                    <Title level={4} style={{ color: "red" }}>
                      {overview.totalLockedUsers.toLocaleString()}
                    </Title>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Báo cáo người dùng">
                    <Title level={4} style={{ color: "orange" }}>
                      {overview.totalUserReports.toLocaleString()}
                    </Title>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card title="Báo cáo bài viết">
                    <Title level={4} style={{ color: "orange" }}>
                      {overview.totalPostReports.toLocaleString()}
                    </Title>
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Thống kê báo cáo">
                    <GrowthChart />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Phân bổ người dùng">
                    <UserPieChart />
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Card title="Bài viết mới từ người dùng">
                <Table
                  dataSource={recentPosts.map((post) => ({
                    ...post,
                    key: post.id,
                  }))}
                  columns={columns}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
