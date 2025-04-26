import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Action gửi báo cáo bài viết
export const reportPost = createAsyncThunk(
  "report/reportPost",
  async ({ postId, reason }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      const response = await axios.post(
        "https://localhost:7053/api/report/report-post",
        { postId, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
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
