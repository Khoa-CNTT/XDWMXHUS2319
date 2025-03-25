import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const token = localStorage.getItem("token");
//Lấy danh sách bài viết
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await axios.get(
    "https://localhost:7053/api/Post/getallpost?pageSize=10",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data.posts;
});

//Like bài viết
export const likePost = createAsyncThunk("posts/likePosts", async (postId) => {
  await axios.post(
    "https://localhost:7053/api/Like/like",
    { postId: postId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return postId;
});

//Load Comment All Comment
export const commentPost = createAsyncThunk(
  "posts/commentPost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://localhost:7053/api/Comment/GetCommentByPost/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { postId, comments: response.data.data }; // Trả về danh sách comments
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

//AddComment post
export const addCommentPost = createAsyncThunk(
  "posts/addCommentPost",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://localhost:7053/api/Comment/CommentPost",
        {
          postId: postId,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // return response.data;
      return { postId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi xảy ra");
    }
  }
);
