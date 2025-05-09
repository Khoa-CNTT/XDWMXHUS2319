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

// Lấy danh sách báo cáo người dùng (user-user reports)
export const fetchUserUserReports = createAsyncThunk(
  "report/fetchUserUserReports",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
      }
      const response = await axios.get(
        "https://localhost:7053/api/report/user-user-report",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // Giả định response.data là mảng báo cáo người dùng
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        return rejectWithValue(
          error.response.data?.message ||
            "Có lỗi xảy ra khi lấy danh sách báo cáo người dùng!"
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
// Action lấy danh sách bài post bởi admin
export const fetchPostsByAdmin = createAsyncThunk(
  "adminPosts/fetchPostsByAdmin",
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
      return response.data.data;
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

// Action duyệt bài viết
export const approvePost = createAsyncThunk(
  "adminPosts/approvePost",
  async (postId, { rejectWithValue }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return rejectWithValue({ message: "Bạn chưa đăng nhập!" });
    }

    try {
      const response = await axios.patch(
        `https://localhost:7053/api/post/approve?PostId=${postId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { postId, ...response.data };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          return rejectWithValue({ message: "Phiên đăng nhập hết hạn" });
        }
        return rejectWithValue(
          error.response.data?.message || "Không thể duyệt bài viết!"
        );
      } else if (error.request) {
        return rejectWithValue({ message: "Không kết nối được với server" });
      }
      return rejectWithValue({ message: "Lỗi không xác định" });
    }
  }
);
//Xóa bài viết
export const adDeletePost = createAsyncThunk(
  "posts/deletePost",
  async (postID, { rejectWithValue }) => {
    // console.log("postID nhận được:", postID, "Loại:", typeof postID);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://localhost:7053/api/Post/ad-delete?PostId=${postID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      // console.log("Xóa bài viết thành công!", response.data);
      return postID;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
