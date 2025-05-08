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
          //   headers: { Authorization: `Bearer ${token}` },
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
        "https://localhost:7053/api/AdminDashboard/user-stats",
        {
          //   headers: { Authorization: `Bearer ${token}` },
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
        "https://localhost:7053/api/AdminDashboard/report-stats",
        {
          //   headers: { Authorization: `Bearer ${token}` },
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
export const fetchRecentPosts = createAsyncThunk(
  "dashboard/fetchRecentPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://localhost:7053/api/Dashboard/recent-posts",
        {
          //   headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi lấy bài viết mới";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);
