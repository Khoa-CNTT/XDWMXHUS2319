import React from "react";
import axios from "axios";

const URL = "https://localhost:7053/api/Auth/refresh-token";
const refreshToken = async () => {
  try {
    const response = await axios.post(URL, {}, { withCredentials: true });
    const newToken = response.data.data;

    console.log("Token>>", newToken);
    localStorage.setItem("token", response.data.data); // Lưu token chính xác
    return newToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log("Refresh token expired, logging out...");
      localStorage.removeItem("token"); // Xóa token
      window.location.href = "/login"; // Điều hướng về trang đăng nhập
    }
    return null;
  }
};

// Tự động gọi refreshToken mỗi 50 phút
const startAutoRefresh = () => {
  // Gọi refreshToken ngay khi app chạy
  refreshToken();

  // Sau đó, thiết lập auto refresh mỗi 50 phút
  const interval = setInterval(async () => {
    const newToken = await refreshToken();

    // Nếu refresh thất bại (token hết hạn), dừng interval
    if (!newToken) {
      clearInterval(interval);
    }
  }, 50 * 60 * 1000);
};
export { startAutoRefresh };
