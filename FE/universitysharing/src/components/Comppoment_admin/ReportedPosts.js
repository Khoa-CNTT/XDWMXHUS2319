import React, { useEffect } from "react";
import { Table, Tag, Space, Modal, Button, message } from "antd";
import {
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import {
  fetchReportedPosts,
  approvePost,
  rejectPost,
} from "../../store/admin/adminActions";

const { confirm } = Modal;

const ReportedPosts = ({
  reportedPosts,
  loading,
  fetchReportedPosts,
  approvePost,
  rejectPost,
}) => {
  useEffect(() => {
    fetchReportedPosts();
  }, [fetchReportedPosts]);

  const handleApprove = (postId) => {
    confirm({
      title: "Xác nhận duyệt bài?",
      icon: <ExclamationCircleOutlined />,
      content: "Bài viết sẽ được khôi phục và hiển thị bình thường",
      onOk() {
        return approvePost(postId).then(() =>
          message.success("Đã duyệt bài viết")
        );
      },
    });
  };

  const handleReject = (postId) => {
    confirm({
      title: "Xác nhận từ chối bài?",
      icon: <ExclamationCircleOutlined />,
      content: "Bài viết sẽ bị xóa vĩnh viễn",
      okText: "Xóa",
      okType: "danger",
      onOk() {
        return rejectPost(postId).then(() =>
          message.success("Đã từ chối bài viết")
        );
      },
    });
  };

  const columns = [
    {
      title: "Bài viết",
      dataIndex: "content",
      key: "content",
      render: (text) => <div className="truncate-text">{text}</div>,
      width: "40%",
    },
    {
      title: "Người đăng",
      dataIndex: ["author", "name"],
      key: "author",
      render: (_, record) => (
        <span>
          {record.author.name} ({record.author.email})
        </span>
      ),
    },
    {
      title: "Số lần báo cáo",
      dataIndex: "reportCount",
      key: "reportCount",
      sorter: (a, b) => a.reportCount - b.reportCount,
    },
    {
      title: "Lý do báo cáo",
      key: "reasons",
      render: (_, record) => (
        <Space direction="vertical">
          {record.reports.slice(0, 2).map((report, index) => (
            <Tag color="red" key={index}>
              {report.reason}
            </Tag>
          ))}
          {record.reports.length > 2 && (
            <Tag>+{record.reports.length - 2} lý do khác</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.id)}
          >
            Từ chối
          </Button>
          <Button type="link" onClick={() => viewDetails(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const viewDetails = (post) => {
    Modal.info({
      title: "Chi tiết báo cáo",
      width: "60%",
      content: (
        <div>
          <h4>Nội dung bài viết:</h4>
          <p>{post.content}</p>

          <h4 style={{ marginTop: 20 }}>Danh sách báo cáo:</h4>
          <Table
            dataSource={post.reports}
            columns={[
              {
                title: "Người báo cáo",
                dataIndex: ["reporter", "name"],
                key: "reporter",
              },
              {
                title: "Lý do",
                dataIndex: "reason",
                key: "reason",
              },
              {
                title: "Thời gian",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (date) => new Date(date).toLocaleString(),
              },
            ]}
            pagination={false}
            size="small"
          />
        </div>
      ),
    });
  };

  return (
    <div className="reported-posts-container">
      <h2>Quản lý bài viết bị báo cáo</h2>
      <Table
        columns={columns}
        dataSource={reportedPosts}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  reportedPosts: state.admin.reportedPosts,
  loading: state.admin.loading,
});

const mapDispatchToProps = {
  fetchReportedPosts,
  approvePost,
  rejectPost,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportedPosts);
