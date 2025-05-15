import React, { useState, useEffect } from "react";
import "../../admin/styles/UserManagement.scss";
import AppHeader from "../components/HeaderBar";
import AppSidebar from "../components/SideBarMenu";
import {
  FaSearch,
  FaBan,
  FaPause,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { message } from "antd";
import BlockUserModal from "../components/UserManager/BlockUserModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPhoneNumbers, setShowPhoneNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [modalAction, setModalAction] = useState(null); // "block" hoặc "suspend"
  const [modalTitle, setModalTitle] = useState(""); // Tiêu đề modal

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        if (!token) {
          throw new Error("No auth token found");
        }
        const response = await fetch(
          `https://localhost:7053/api/Admin/GetallUser`, // Thêm dấu phẩy
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (result.success && result.data) {
          const mappedUsers = result.data.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            createdAt: user.createdAt,
            isVerifiedEmail: user.isVerifiedEmail,
            trustScore: user.trustScore,
            role: user.role === 0 ? "User" : "Admin",
            phone: user.phone || "N/A",
            relativePhone: user.relativePhone || "N/A",
            status: user.status,
            totalReports: user.totalReports,
            lastLoginDate: user.lastActive,
          }));
          setUsers(mappedUsers);
        } else {
          setError("Không thể tải danh sách người dùng.");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi lấy danh sách người dùng.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Tự động xóa thông báo lỗi sau 5 giây
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Lọc người dùng dựa trên từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mở modal cho hành động chặn hoặc tạm ngưng
  const showBlockModal = (id, action) => {
    console.log(`Opening modal for action: ${action}, user ID: ${id}`);
    setSelectedUserId(id);
    setModalAction(action);
    setModalTitle(
      action === "block"
        ? "Chọn thời gian hết hạn chặn"
        : "Chọn thời gian hết hạn tạm ngưng"
    );
    setBlockModalVisible(true);
  };

  // Xử lý xác nhận chặn hoặc tạm ngưng
  const handleModalConfirm = async (untilISO) => {
    if (!untilISO) {
      setError("Vui lòng chọn thời gian hết hạn.");
      return;
    }

    try {
      const endpoint =
        modalAction === "block"
          ? `https://localhost:7053/api/Admin/${selectedUserId}/block?blockUntil=${encodeURIComponent(
              untilISO
            )}`
          : `https://localhost:7053/api/Admin/${selectedUserId}/suspend?suspendUntil=${encodeURIComponent(
              untilISO
            )}`;

      console.log(`Sending ${modalAction} request to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === selectedUserId
              ? {
                  ...user,
                  status: modalAction === "block" ? "Blocked" : "Suspended",
                  [modalAction === "block" ? "blockedUntil" : "suspendedUntil"]:
                    untilISO,
                }
              : user
          )
        );
        setBlockModalVisible(false);
        setSelectedUserId(null);
        setModalAction(null);
        message.success(
          modalAction === "block"
            ? "Chặn người dùng thành công!"
            : "Tạm ngưng người dùng thành công!"
        );
      } else {
        setError(
          `Không thể ${
            modalAction === "block" ? "chặn" : "tạm ngưng"
          } người dùng: ${result.message || "Lỗi không xác định"}`
        );
      }
    } catch (err) {
      setError(
        `Đã xảy ra lỗi khi ${
          modalAction === "block" ? "chặn" : "tạm ngưng"
        } người dùng: ${err.message}`
      );
      console.error("Error details:", err);
    }
  };

  // Xử lý kích hoạt (unblock) người dùng
  const handleActivate = async (id) => {
    try {
      const endpoint = `https://localhost:7053/api/Admin/${id}/unblock`;
      console.log(`Sending unblock request to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log(`Unblock response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === id
              ? {
                  ...user,
                  status: "Active",
                  blockedUntil: null,
                  suspendedUntil: null,
                }
              : user
          )
        );
        message.success("Kích hoạt người dùng thành công!");
      } else {
        setError(
          `Không thể kích hoạt người dùng: ${
            result.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi kích hoạt người dùng: ${err.message}`);
      console.error("Unblock error details:", err);
    }
  };

  // Đóng modal
  const handleModalCancel = () => {
    setBlockModalVisible(false);
    setSelectedUserId(null);
    setModalAction(null);
  };

  // Ẩn/hiện số điện thoại
  const togglePhoneVisibility = (id, type) => {
    setShowPhoneNumbers((prev) => ({
      ...prev,
      [`${id}-${type}`]: !prev[`${id}-${type}`],
    }));
  };

  // Che số điện thoại, chỉ hiển thị 3 số cuối
  const maskPhoneNumber = (phone, id, type) => {
    if (!phone || phone === "N/A") return "N/A";
    if (showPhoneNumbers[`${id}-${type}`]) return phone;
    return "****" + phone.slice(-3);
  };

  return (
    <div className="user-management">
      <AppHeader />
      <AppSidebar />
      <h1>Quản lý người dùng</h1>

      {/* Thông báo lỗi */}
      {error && <div className="error-message">{error}</div>}

      {/* Trạng thái tải */}
      {loading && <div className="loading">Đang tải dữ liệu...</div>}

      {/* Thanh tìm kiếm */}
      {!loading && (
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Nhập bằng tên hoặc email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Modal chọn thời gian */}
      <BlockUserModal
        visible={blockModalVisible}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        userId={selectedUserId}
        title={modalTitle}
      />

      {/* Bảng người dùng */}
      {!loading && (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Ngày tạo</th>
                <th>Xác thực</th>
                <th>Điểm uy tín</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Số liên lạc</th>
                <th>Số người thân</th>
                <th>Reports</th>
                <th>Lần đăng nhập cuối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.isVerifiedEmail ? "Có" : "Không"}</td>
                  <td>{user.trustScore}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td className="phone-cell">
                    <span>{maskPhoneNumber(user.phone, user.id, "phone")}</span>
                    <button
                      className="toggle-visibility"
                      onClick={() => togglePhoneVisibility(user.id, "phone")}
                    >
                      {showPhoneNumbers[`${user.id}-phone`] ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </td>
                  <td className="phone-cell">
                    <span>
                      {maskPhoneNumber(
                        user.relativePhone,
                        user.id,
                        "relativePhone"
                      )}
                    </span>
                    <button
                      className="toggle-visibility"
                      onClick={() =>
                        togglePhoneVisibility(user.id, "relativePhone")
                      }
                    >
                      {showPhoneNumbers[`${user.id}-relativePhone`] ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </td>
                  <td>{user.totalReports}</td>
                  <td>
                    {user.lastLoginDate
                      ? new Date(user.lastLoginDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="actions">
                    <button
                      title="Chặn người dùng"
                      onClick={() => showBlockModal(user.id, "block")}
                      disabled={user.status === "Blocked"}
                    >
                      <FaBan />
                    </button>
                    <button
                      title="Tạm ngưng người dùng"
                      onClick={() => showBlockModal(user.id, "suspend")}
                      disabled={user.status === "Suspended"}
                    >
                      <FaPause />
                    </button>
                    <button
                      title="Kích hoạt người dùng"
                      onClick={() => handleActivate(user.id)}
                      disabled={user.status === "Active"}
                    >
                      <FaCheckCircle />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
