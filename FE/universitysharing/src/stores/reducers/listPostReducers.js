import { createSlice } from "@reduxjs/toolkit";
import {
  addCommentPost,
  commentPost,
  fetchPosts,
  likePost,
  likeComment,
} from "../action/listPostActions";

const listPostSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    comments: {},
    selectedPost: null,
    isShareModalOpen: false,
    selectedPostToShare: null,
    selectedPostToOption: null,
    isPostOptionsOpen: false, // 🆕 Thêm trạng thái modal options
  },
  reducers: {
    hidePost: (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
    },
    openCommentModal: (state, action) => {
      state.selectedPost = action.payload;
    },
    closeCommentModal: (state) => {
      state.selectedPost = null;
    },
    openShareModal: (state, action) => {
      state.selectedPostToShare = action.payload;
      state.isShareModalOpen = true;
    },
    closeShareModal: (state) => {
      state.isShareModalOpen = false;
      state.selectedPostToShare = null;
    },
    openPostOptionModal: (state, action) => {
      state.selectedPostToOption = action.payload; // Lưu bài viết đang chọn
      state.isPostOptionsOpen = true; // Mở modal
    },
    closePostOptionModal: (state) => {
      state.isPostOptionsOpen = false;
      state.selectedPostToOption = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                hasLiked: !post.hasLiked,
                likeCount: post.hasLiked
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post
        );
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const commentId = action.payload;

        // Duyệt qua từng bài post trong danh sách
        Object.keys(state.comments).forEach((postId) => {
          // Duyệt qua danh sách comment của post đó
          state.comments[postId] = state.comments[postId].map((comment) => {
            // Nếu comment chính được like
            if (comment.id === commentId) {
              return {
                ...comment,
                hasLiked: comment.hasLiked ? 0 : 1,
                likeCountComment: comment.hasLiked
                  ? comment.likeCountComment - 1
                  : comment.likeCountComment + 1,
              };
            }

            // Nếu là một comment có replies, kiểm tra trong replies
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    hasLiked: reply.hasLiked ? 0 : 1,
                    likeCountComment: reply.hasLiked
                      ? reply.likeCountComment - 1
                      : reply.likeCountComment + 1,
                  }
                : reply
            );

            return {
              ...comment,
              replies: updatedReplies,
            };
          });
        });
      })

      // .addCase(commentPost.fulfilled, (state, action) => {
      //   const { postId, comments } = action.payload;
      //   state.comments[postId] = comments;
      // }) //Lấy bình luận thuần kiểu có gì nhận nấy

      //Đưa các bình luận cấp 3+ lên trên cấp 2
      .addCase(commentPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;

        let newComments = [];

        comments.forEach((comment) => {
          // Tạo một bản sao bình luận cấp 1, nhưng xóa replies để tự xử lý lại
          let parentComment = { ...comment, replies: [] };

          let level2Replies = []; // Lưu danh sách cấp 2

          comment.replies.forEach((reply) => {
            // Nếu reply có replies con (cấp 3+), đẩy chúng ra cùng cấp 2
            let extractedReplies = reply.replies.map((subReply) => ({
              ...subReply,
              parentCommentId: comment.id, // Đưa lên thành cấp 2
            }));

            // Tạo bình luận cấp 2, xóa replies vì đã tách riêng
            let childComment = { ...reply, replies: [] };

            level2Replies.push(childComment, ...extractedReplies);
          });

          // Gán lại danh sách replies (chỉ có cấp 2)
          parentComment.replies = level2Replies;

          // Đưa bình luận cấp 1 vào danh sách chính
          newComments.push(parentComment);
        });

        // Cập nhật state
        state.comments[postId] = newComments;
      })

      .addCase(addCommentPost.fulfilled, (state, action) => {
        // console.log("🔥 Payload nhận được:", action.payload);
        const { postId, data } = action.payload;
        if (!postId || !data) return;

        const newComment = {
          id: data.commentId,
          userId: state.auth?.user?.id || "",
          userName: data.fullName,
          profilePicture: data.profilePicture,
          content: data.content,
          createdAt: data.createdAt,
          hasLiked: 0,
          likeCountComment: 0,
          replies: [],
          parentCommentId: null,
        };

        // 🛠 FIX: Nếu `state.comments[postId]` chưa tồn tại, khởi tạo nó là một mảng rỗng
        if (!Array.isArray(state.comments[postId])) {
          state.comments[postId] = [];
        }

        // Thêm comment mới vào mảng
        state.comments[postId].push(newComment);

        // Cập nhật số lượng bình luận trong bài post
        const postIndex = state.posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentCount += 1;
        }
      });
  },
});

export const {
  hidePost,
  openCommentModal,
  closeCommentModal,
  openShareModal,
  closeShareModal,
  openPostOptionModal,
  closePostOptionModal,
} = listPostSlice.actions;

export default listPostSlice.reducer;
