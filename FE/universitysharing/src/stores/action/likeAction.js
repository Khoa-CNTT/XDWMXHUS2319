import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchLikes = createAsyncThunk(
  "posts/fetchLikes",
  async ({ postId, lastUserid = null }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      // Construct the API URL with the optional lastUserid parameter
      const url = lastUserid
        ? `https://localhost:7053/api/Like/get-likes?postid=${postId}&lastUserid=${lastUserid}`
        : `https://localhost:7053/api/Like/get-likes?postid=${postId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        postId,
        data: response.data.data, // Contains likeCount, likedUsers, nextCursor
      };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        } else if (error.response.status === 404) {
          return rejectWithValue({ message: "Không tìm thấy lượt thích" });
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
