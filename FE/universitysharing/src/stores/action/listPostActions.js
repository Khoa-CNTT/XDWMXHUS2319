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
        `https://localhost:7053/api/Comment/GetCommentByPost?PostId=${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("ID PostID selected : >>", postId);
      // console.log("Data CMT : >>", response.data.data);
      return { postId, comments: response.data.data.comments }; // Trả về danh sách comments
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

//LikeComment
export const likeComment = createAsyncThunk(
  "posts/likeComment",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `https://localhost:7053/api/CommentLike/like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || " Đã có lỗi ");
    }
  }
);

//Rely comment
export const ReplyComment = createAsyncThunk(
  "post/replyComment",
  async ({ postId, commentId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://localhost:7053/api/Comment/ReplyComment",
        {
          postId: postId,
          parentCommentId: commentId,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { commentId, data: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Có lỗi khi comment");
    }
  }
);
