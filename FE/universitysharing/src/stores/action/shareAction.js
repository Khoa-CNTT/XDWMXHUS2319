import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchShares = createAsyncThunk(
  "posts/fetchShares",
  async ({ postId, lastUserid = null }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      // Construct the API URL with parameters
      const params = { postid: postId };
      if (lastUserid) {
        params.lastUserid = lastUserid;
      }

      const response = await axios.get(
        `https://localhost:7053/api/Share/get-shares`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Kiểm tra nếu response không thành công
      if (!response.data.success) {
        return rejectWithValue({
          message: response.data.message || "Failed to fetch shares",
        });
      }

      // Chuẩn hóa dữ liệu trả về
      return {
        postId,
        data: {
          shareCount: response.data.data.users?.length || 0,
          sharedUsers: response.data.data.users || [],
          nextCursor: response.data.data.nextCursor,
        },
      };
    } catch (error) {
      if (error.response) {
        // Xử lý các mã lỗi HTTP khác nhau
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        } else if (error.response.status === 404) {
          return rejectWithValue({ message: "Không có lượt chia sẻ nào" });
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
