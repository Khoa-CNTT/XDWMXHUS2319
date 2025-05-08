import React, { useState, useEffect } from "react";
import { Layout, Card, Typography, Space, Pagination, message } from "antd";
import { FiSearch, FiFilter, FiCheck, FiTrash2 } from "react-icons/fi";
import "../../admin/styles/AdminPostManagement.scss";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../../stores/action/profileActions";
import {
  fetchPostsByAdmin,
  approvePost,
  adDeletePost,
} from "../../stores/action/adminActions";
import { clearPostState } from "../../stores/reducers/adminReducer";

const { Content } = Layout;
const { Title } = Typography;

const AdminPostManagement = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  const {
    posts = [],
    totalCount = 0,
    loading = false,
    error = null,
    success = false,
  } = useSelector((state) => state.reportAdmintSlice || {});

  console.log("Redux State:", { posts, totalCount, loading, error, success });

  useEffect(() => {
    dispatch(fetchPostsByAdmin({ pageNumber: currentPage, pageSize }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      console.log("Error:", error);
      message.error(error);
      dispatch(clearPostState());
    }
    if (success) {
      console.log("Posts:", posts);
      message.success("Lấy danh sách bài viết thành công");
      dispatch(clearPostState());
    }
  }, [error, success, dispatch, posts]);

  // Ánh xạ approvalStatus từ số sang chuỗi
  const mapApprovalStatus = (status) => {
    switch (status) {
      case 1:
        return "Approved";
      case 0:
        return "Pending";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  // Lọc bài viết
  const filteredPosts = posts.filter((post) => {
    const status = mapApprovalStatus(post.approvalStatus);
    return (
      (post.content || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "all" || status === filterStatus)
    );
  });

  console.log("Filtered Posts:", filteredPosts);

  const truncateContent = (content, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý duyệt bài viết
  const handleApprovePost = (postId) => {
    dispatch(approvePost(postId))
      .unwrap()
      .then(() => {
        message.success("Duyệt bài viết thành công");
      })
      .catch((err) => {
        message.error(err.message || "Không thể duyệt bài viết");
      });
  };
  // Xử lý xóa bài viết
  const handleDeletePost = (postId) => {
    dispatch(adDeletePost(postId))
      .unwrap()
      .then(() => {
        message.success("Xóa bài viết thành công");
      })
      .catch((err) => {
        message.error(err.message || "Không thể xóa bài viết");
      });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={{ marginLeft: 200 }}>
        <AppHeader usersProfile={users} />
        <Content style={{ margin: "20px" }}>
          <Title level={3}>Quản lý bài viết</Title>
          <Card
            title="Danh sách bài viết"
            extra={
              <Space>
                <div className="search-bar">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter">
                  <FiFilter className="filter-icon" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="Approved">Đã phê duyệt</option>
                    <option value="Pending">Chờ phê duyệt</option>
                    <option value="Rejected">Bị từ chối</option>
                  </select>
                </div>
              </Space>
            }
          >
            <div className="post-table-container">
              <table className="post-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nội dung</th>
                    <th>Tác giả</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Phạm vi</th>
                    <th>Kiểu</th>
                    <th>Đã xóa</th>
                    <th>Bài Share</th>
                    <th>Điểm</th>
                    <th>Báo cáo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center" }}>
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.id.substring(0, 8)}...</td>
                        <td>{truncateContent(post.content)}</td>
                        <td>{post.author}</td>
                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`status ${mapApprovalStatus(
                              post.approvalStatus
                            ).toLowerCase()}`}
                          >
                            {mapApprovalStatus(post.approvalStatus)}
                          </span>
                        </td>
                        <td>{post.scope}</td>
                        <td>{post.postType}</td>
                        <td>{post.isDeleted ? "Có" : "Không"}</td>
                        <td>{post.isSharedPost ? "Có" : "Không"}</td>
                        <td>{post.score}</td>
                        <td>{post.reportCount}</td>
                        <td>
                          {post.approvalStatus === 0 && (
                            <button
                              className="action-btn approve"
                              onClick={() => handleApprovePost(post.id)}
                            >
                              <FiCheck /> Duyệt
                            </button>
                          )}
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <FiTrash2 /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center" }}>
                        Không có bài viết nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalCount > 0 && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPostManagement;
