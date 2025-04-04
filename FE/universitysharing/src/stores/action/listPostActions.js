import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const token = localStorage.getItem("token");
// console.warn("Token khi bắt đầu đăng nhập 1 >>", token);
//Lấy danh sách bài viết
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (lastPostId = null, { rejectWithValue }) => {
    try {
      console.log("Dang chay");
      const tokens = localStorage.getItem("token");
      const url = lastPostId
        ? `https://localhost:7053/api/Post/getallpost?lastPostId=${lastPostId}`
        : "https://localhost:7053/api/Post/getallpost";
      // console.log("Đang chạy", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${tokens}` },
      });

      // Handle case when no more posts are available
      if (response.data.message === "Không còn bài viết nào để load") {
        return {
          posts: [],
          hasMore: false,
        };
      }

      return {
        posts: response.data.data.posts,
        hasMore: response.data.data.nextCursor !== null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching posts");
    }
  }
);

//Like bài viết
export const likePost = createAsyncThunk("posts/likePosts", async (postId) => {
  const token = localStorage.getItem("token");
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
  async ({ postId, lastCommentId = null }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    try {
      const url = lastCommentId
        ? `https://localhost:7053/api/Comment/GetCommentByPost?PostId=${postId}&lastCommentId=${lastCommentId}`
        : `https://localhost:7053/api/Comment/GetCommentByPost?PostId=${postId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        postId,
        comments: response.data.data.comments,
        hasMore: response.data.data.lastCommentId !== null,
        isInitialLoad: !lastCommentId,
      };
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
      const token = localStorage.getItem("token");
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
    const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
      // console.log("formData", formData);
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

//Chỉnh sửa bài viết
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (
    { postId, formData, fullName, profilePicture, createdAt },
    { rejectWithValue }
  ) => {
    const token = localStorage.getItem("token");
    try {
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]); // In key và value của FormData
      }

      const response = await axios.patch(
        "https://localhost:7053/api/Post/update-post",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token trong header
          },
        }
      );
      console.log("Response từ API >>", response.data); // Kiểm tra response trả về
      if (response.data.data) {
        toast.success("Sửa bài viết thành công!");
        return {
          postId,
          data: response.data.data,
          fullName,
          profilePicture,
          createdAt,
        };
        console.log("respone>>", response.data.data);
      } else {
        toast.error("Sửa bài viết không thành công!");
        return rejectWithValue("Dữ liệu trả về không hợp lệ");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
      const token = localStorage.getItem("token");
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
    // console.log("Id cha>>", parentId);
    // console.log("Id post>>", parentId);
    // console.log("Id content>>", parentId);
    try {
      const token = localStorage.getItem("token");
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

//listpostaction
export const sharePost = createAsyncThunk(
  "post/sharePost",

  async ({ postId, content }, { rejectWithValue }) => {
    console.log("sharePost action started", { postId, content }); // Thêm dòng này
    try {
      const token = localStorage.getItem("token");
      // if (!token) throw new Error('Vui lòng đăng nhập');

      const response = await axios.post(
        "https://localhost:7053/api/Share/SharePost",
        { postId, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Chia sẻ thất bại");
      }
      console.log("chia se");
      // Format dữ liệu theo chuẩn BE trả về
      const formatSharedPost = (apiData) => ({
        id: apiData.id,
        userId: apiData.userId,
        fullName: apiData.fullName,
        profilePicture: apiData.profilePicture,
        content: apiData.content,
        createdAt: apiData.createdAt,
        isSharedPost: true,
        originalPost: {
          postId: apiData.originalPostId,
          content: apiData.originalPost.content,
          author: apiData.originalPost.author,
          createAt: apiData.originalPost.createAt,
        },
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
        },
      });

      toast.success(response.data.message);
      return formatSharedPost(response.data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(errorMsg);
      return rejectWithValue({
        message: errorMsg,
        code: error.response?.status,
      });
    }
  }
);

// Lấy bài viết của người sở hữu (tự động lấy theo token)
export const fetchPostsByOwner = createAsyncThunk(
  "posts/fetchPostsByOwner",
  async (lastPostId = null, { rejectWithValue }) => {
    try {
      const tokens = localStorage.getItem("token");
      const url = lastPostId
        ? `https://localhost:7053/api/Post/GetPostsByOwner?lastPostId=${lastPostId}`
        : "https://localhost:7053/api/Post/GetPostsByOwner";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${tokens}` },
      });
      // Handle case when no more posts are available
      if (response.data.message === "Không còn bài viết nào để load") {
        return {
          posts: [],
          hasMore: false,
        };
      }
      return {
        posts: response.data.data.posts,
        hasMore: response.data.data.nextCursor !== null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching owner posts"
      );
    }
  }
);
