import React from "react";
import { Layout, Card, Row, Col, Table, Typography, Divider } from "antd";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";
import AllReport from "../components/UserReport/AllReport";
const { Content } = Layout;
const { Title } = Typography;

const UserReport = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={{ marginLeft: 200 }}>
        <AppHeader />
        <Content style={{ margin: "20px" }}>
          <Title level={3}>Báo cáo từ người dùng</Title>
          <Card title="Báo cáo mới của người dùng">
            <AllReport />
            {/* <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            /> */}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserReport;
