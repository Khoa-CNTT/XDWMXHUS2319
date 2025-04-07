import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

//search post
export const searchPost = createAsyncThunk(
  "searchs/searchPost",
  async (keyword, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      const response = await axios.get(`https://localhost:7053/api/Search`, {
        params: { keyword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // Handle different HTTP error statuses
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        } else if (error.response.status === 404) {
          return rejectWithValue({ message: "Không tìm thấy kết quả" });
        }
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue({
          message: "Không kết nối được với server",
        });
      }
      return rejectWithValue({
        message: "Lỗi không xác định",
      });
    }
  }
);
