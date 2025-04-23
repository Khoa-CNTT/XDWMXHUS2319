import React from "react";
import { Layout, Card, Row, Col, Table, Typography, Divider } from "antd";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";
import GrowthChart from "../components/DashBoard/GrowthChart";
import UserPieChart from "../components/DashBoard/PieChart";
const { Content } = Layout;
const { Title } = Typography;

const dataSource = [
  {
    key: "1",
    user: "Người dùng A",
    content: "Bài viết mẫu...",
    status: "Đã duyệt",
    likes: 10,
    comments: 5,
    shares: 3,
  },
  {
    key: "2",
    user: "Người dùng A",
    content: "Bài viết mẫu...",
    status: "Đã duyệt",
    likes: 10,
    comments: 5,
    shares: 3,
  },
];

const columns = [
  { title: "Người dùng", dataIndex: "user" },
  { title: "Nội dung bài viết", dataIndex: "content" },
  { title: "Trạng thái bài viết", dataIndex: "status" },
  { title: "Lượt thích", dataIndex: "likes" },
  { title: "Lượt bình luận", dataIndex: "comments" },
  { title: "Lượt chia sẻ", dataIndex: "shares" },
];

const Dashboard = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={{ marginLeft: 200 }}>
        <AppHeader />
        <Content style={{ margin: "20px" }}>
          <Title level={3}>DashBoard</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Số lượng người dùng">
                <Title level={4} style={{ color: "green" }}>
                  170.040.005
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Số lượng bài viết">
                <Title level={4} style={{ color: "green" }}>
                  170.040.005
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Số lượng chuyển đi thành công">
                <Title level={4} style={{ color: "green" }}>
                  170.040.005
                </Title>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Biểu đồ tăng trưởng">
                <GrowthChart />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Biểu đồ phân ảnh người dùng">
                <UserPieChart />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card title="Bài viết mới từ người dùng">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
