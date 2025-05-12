import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lấy tổng quan dashboard
export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchDashboardOverview",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/AdminDashboard/overview",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi lấy tổng quan dashboard";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Lấy thống kê người dùng
export const fetchUserStats = createAsyncThunk(
  "dashboard/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7053/api/AdminDashboard/user-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi lấy thống kê người dùng";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Lấy thống kê báo cáo
export const fetchReportStats = createAsyncThunk(
  "dashboard/fetchReportStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://localhost:7053/api/AdminDashboard/report-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi lấy thống kê báo cáo";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// Lấy bài viết mới
// dashboardActions.js
export const fetchRecentPosts = createAsyncThunk(
  "dashboard/fetchRecentPosts",
  async ({ pageNumber, pageSize }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
      }

      const response = await axios.get(
        `https://localhost:7053/api/post/get-posts-by-admin?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      const posts = response.data.data?.posts || []; // Đảm bảo trả về mảng rỗng nếu posts không tồn tại
      return posts;
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        if (error.response.status === 403) {
          return rejectWithValue({ message: "Bạn không có quyền truy cập" });
        }
        return rejectWithValue(
          error.response.data?.message ||
            "Có lỗi xảy ra khi lấy danh sách bài viết!"
        );
      } else if (error.request) {
        return rejectWithValue({ message: "Không kết nối được với server" });
      }
      return rejectWithValue({ message: "Lỗi không xác định" });
    }
  }
);
