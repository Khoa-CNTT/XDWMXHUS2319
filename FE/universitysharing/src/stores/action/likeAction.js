import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchLikes = createAsyncThunk(
  "posts/fetchLikes",
  async ({ postId, lastUserid = null }, { rejectWithValue, getState }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    // Lấy state hiện tại để kiểm tra
    const state = getState();
    const existingLikes = state.posts.postLikes[postId];

    // Nếu đang yêu cầu load more (có lastUserid) mà nextCursor đã null thì không gọi API
    if (lastUserid !== null && existingLikes?.nextCursor === null) {
      // Trả về dữ liệu hiện tại mà không gọi API
      return {
        postId,
        data: existingLikes,
        hasReachedEnd: true, // Thêm flag để nhận biết đã tải hết
      };
    }

    try {
      // Chỉ thêm lastUserid vào URL nếu nó tồn tại VÀ nextCursor chưa null
      const url =
        lastUserid && existingLikes?.nextCursor !== null
          ? `https://localhost:7053/api/Like/get-likes?postid=${postId}&lastUserid=${lastUserid}`
          : `https://localhost:7053/api/Like/get-likes?postid=${postId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        postId,
        data: response.data.data,
        hasReachedEnd: response.data.data.nextCursor === null, // Đánh dấu nếu đã tải hết
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
