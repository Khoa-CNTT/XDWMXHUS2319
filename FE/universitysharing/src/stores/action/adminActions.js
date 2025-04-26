import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Lấy danh sách bài viết có báo cáo
export const fetchReportedPosts = createAsyncThunk(
  "report/fetchReportedPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
      }
      const response = await axios.get(
        "https://localhost:7053/api/report/posts-report",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Giả định response.data là mảng bài viết có báo cáo
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        return rejectWithValue(
          error.response.data?.message ||
            "Có lỗi xảy ra khi lấy danh sách báo cáo!"
        );
      } else if (error.request) {
        return rejectWithValue({ message: "Không kết nối được với server" });
      }
      return rejectWithValue({ message: "Lỗi không xác định" });
    }
  }
);

// Action xóa bài viết
export const deletePost = createAsyncThunk(
  "report/deletePost",
  async (postId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      const response = await axios.patch(
        `https://localhost:7053/api/report/delete-post-report/${postId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { postId, ...response.data }; // Trả về postId để cập nhật UI
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue({ message: "Không kết nối được với server" });
      }
      return rejectWithValue({ message: "Lỗi không xác định" });
    }
  }
);

// Action xóa tất cả báo cáo của bài viết
export const deleteAllReports = createAsyncThunk(
  "report/deleteAllReports",
  async (postId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      const response = await axios.delete(
        `https://localhost:7053/api/report/delete-all-report/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { postId, ...response.data }; // Trả về postId để cập nhật UI
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue({ message: "Không kết nối được với server" });
      }
      return rejectWithValue({ message: "Lỗi không xác định" });
    }
  }
);
