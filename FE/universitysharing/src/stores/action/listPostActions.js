import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    // console.log(
    //   "postID nhận được load Comment",
    //   postId,
    //   "Loại:",
    //   typeof postId
    // );
    try {
      const response = await axios.get(
        `https://localhost:7053/api/Comment/GetCommentByPost?PostId=${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { postId, comments: response.data.data.comments }; // Trả về danh sách comments
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi không xác định");
    }
  }
);

//AddComment post
export const addCommentPost = createAsyncThunk(
  "posts/addCommentPost",
  async ({ postId, content, userId }, { rejectWithValue }) => {
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
      if (!response.data.success) {
        toast.warning("Bình luận của bạn có ngôn từ không chuẩn mực!");
      }
      // return response.data;
      return { postId, data: response.data.data, userId };
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

// //Đăng bài
export const createPost = createAsyncThunk(
  "post/createPost",
  async ({ formData, fullName, profilePicture }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://localhost:7053/api/Post/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      if (response.data.success) {
        // console.log("Đăng bài thành công ");
        toast.success("Đăng bài thành công!");
        return {
          fullName,
          profilePicture,
          ...response.data.data,
          updateAt: null, // API không trả về updateAt, nên thêm vào để đồng bộ
          commentCount: 0,
          likeCount: 0,
          shareCount: 0,
          hasLiked: false,
          isSharedPost: false,
        };
      } else {
        toast.error("Đăng bài thất bại!");
        return rejectWithValue(response.data.errors);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//Xóa bài viết
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postID, { rejectWithValue }) => {
    // console.log("postID nhận được:", postID, "Loại:", typeof postID);
    try {
      const response = await axios.delete(
        `https://localhost:7053/api/Post/delete?PostId=${postID}`,
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

//Lấy comment reply
export const getReplyComment = createAsyncThunk(
  "post/getReplyComment",
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://localhost:7053/api/Comment/replies?ParentCommentId=${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      console.log("Data comment reply", response.data.data.replies);
      return { commentId, data: response.data.data.replies };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//Xóa comment
export const deleteComments = createAsyncThunk(
  "posts/deleteComments",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `https://localhost:7053/api/Comment/DeleteComment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      console.log("Xóa comment thành công");
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//Reply comment
export const replyComments = createAsyncThunk(
  "post/replyComments",
  async ({ postId, parentId, content, userId }, { rejectWithValue }) => {
    console.log("Id cha>>", parentId);
    console.log("Id post>>", parentId);
    console.log("Id content>>", parentId);
    try {
      const response = await axios.post(
        "https://localhost:7053/api/Comment/ReplyComment",
        {
          postId: postId,
          parentCommentId: parentId,
          content: content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      if (!response.data.success) {
        toast.warning("Bình luận của bạn có ngôn từ không chuẩn mực!");
      }
      console.log("Trả về data", response.data.data);
      return { postId, data: response.data.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
