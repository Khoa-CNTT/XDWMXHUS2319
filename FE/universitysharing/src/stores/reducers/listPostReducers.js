import { createSlice } from "@reduxjs/toolkit";
import {
  addCommentPost,
  commentPost,
  fetchPosts,
  fetchPostsByOwner, // Add this import
  likePost,
  likeComment,
  createPost,
  deletePost,
  getReplyComment,
  deleteComments,
  replyComments,
  updatePost,
  sharePost,
} from "../action/listPostActions";
import { da } from "date-fns/locale";

const listPostSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    hasMoreAllPosts: true,
    hasMoreOwnerPosts: true,
    comments: {},
    selectedPost: null,
    isShareModalOpen: false,
    selectedPostToShare: null,
    selectedPostToOption: null,
    isPostOptionsOpen: false, // 🆕 Thêm trạng thái modal options
    loading: false,
    loadingCreatePost: false,
    // selectedCommentTOption: null,
    // isCommentOptionOpen: false,
    openCommentOptionId: null, // ID comment nào đang mở option
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
    //Mở CommentOption
    openCommentOption: (state, action) => {
      // state.selectedCommentTOption = action.payload;
      // state.isCommentOptionOpen = true;
      state.openCommentOptionId = action.payload;
    },
    closeCommentOption: (state) => {
      // state.isCommentOptionOpen = false;
      // state.selectedCommentTOption = null;
      state.openCommentOptionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        //console.log("Data về >> ", action.payload);
        state.loading = false;
        // state.posts = action.payload;

        if (action.meta.arg) {
          // Append for pagination
          state.posts = [...state.posts, ...action.payload.posts];
        } else {
          // Replace for initial load
          state.posts = action.payload.posts;
        }
        state.hasMoreAllPosts = action.payload.hasMore;
      })
      .addCase(fetchPostsByOwner.fulfilled, (state, action) => {
        // Only append new posts if lastPostId was provided (pagination)
        if (action.meta.arg) {
          // Filter out duplicates before adding new posts
          const newPosts = action.payload.posts.filter(
            (newPost) =>
              !state.posts.some(
                (existingPost) => existingPost.id === newPost.id
              )
          );
          state.posts = [...state.posts, ...newPosts];
        } else {
          // First load - replace all posts
          state.posts = action.payload.posts;
        }
        state.hasMoreOwnerPosts = action.payload.hasMore; // Corrected this line
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
          if (!Array.isArray(state.comments[postId])) {
            state.comments[postId] = []; // Đảm bảo luôn có một mảng hợp lệ
          }

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
            const updatedReplies = Array.isArray(comment.replies)
              ? comment.replies.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        hasLiked: reply.hasLiked ? 0 : 1,
                        likeCountComment: reply.hasLiked
                          ? reply.likeCountComment - 1
                          : reply.likeCountComment + 1,
                      }
                    : reply
                )
              : [];

            return {
              ...comment,
              replies: updatedReplies,
            };
          });
        });
      })

      .addCase(commentPost.fulfilled, (state, action) => {
        const { postId, comments, hasMore, isInitialLoad } = action.payload;

        if (isInitialLoad) {
          // Replace comments for initial load
          state.comments[postId] = comments;
        } else {
          // Append comments for pagination
          state.comments[postId] = [
            ...(state.comments[postId] || []),
            ...comments,
          ];
        }

        // Store hasMore status for each post's comments
        state.commentsHasMore = state.commentsHasMore || {};
        state.commentsHasMore[postId] = hasMore;
      })

      .addCase(addCommentPost.fulfilled, (state, action) => {
        // console.log("🔥 Payload nhận được:", action.payload);
        const { postId, data, userId } = action.payload;
        if (!postId || !data) return;

        const newComment = {
          id: data.commentId,
          userId: userId || "",
          userName: data.fullName,
          profilePicture: data.profilePicture,
          content: data.content,
          createdAt: data.createdAt,
          hasLiked: 0,
          likeCountComment: 0,
          hasMoreReplies: false,
          replies: [],
          parentCommentId: null,
        };

        // Nếu `state.comments[postId]` chưa tồn tại, khởi tạo nó là một mảng rỗng
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
      })

      .addCase(createPost.pending, (state) => {
        state.loadingCreatePost = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loadingCreatePost = false;
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId, data, fullName, profilePicture, createdAt } =
          action.payload;
        const update = {
          id: data.id,
          userId: data.userId,
          fullName: fullName,
          profilePicture: profilePicture,
          content: data.content,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          createdAt: createdAt,
          updateAt: data.updateAt,
          postType: 4,
          commentCount: 0,
          likeCount: 0,
          shareCount: 0,
          hasLiked: 0,
          isSharedPost: false,
        };
        // Tìm vị trí bài viết trong danh sách posts
        const index = state.posts.findIndex((post) => post.id === data.id);
        if (index !== -1) {
          // Cập nhật bài viết trong mảng posts
          state.posts[index] = update;
        }
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      })

      .addCase(getReplyComment.fulfilled, (state, action) => {
        console.log("🔥 Payload getReplyComment:", action.payload);
        const { commentId, data } = action.payload;

        let found = false; // Cờ kiểm tra có tìm thấy comment không

        // Duyệt qua tất cả postId
        Object.keys(state.comments).forEach((postId) => {
          const commentsArray = state.comments[postId]; // Lấy danh sách comment của bài post

          // Tìm comment có id trùng với commentId
          const comment = commentsArray.find((c) => c.id === commentId);
          if (comment) {
            comment.replies = data; // Gán replies vào comment tương ứng
            comment.hasMoreReplies = false;
            found = true;
          }
        });

        if (!found) {
          console.error(
            `⚠️ Không tìm thấy commentId: ${commentId} trong state`
          );
        }
      })

      //Xóa comment
      .addCase(deleteComments.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;

        if (state.comments[postId]) {
          let deletedCount = 0; // Đếm số comment bị xóa

          const isRootComment = state.comments[postId].some(
            (comment) => comment.id === commentId
          );

          if (isRootComment) {
            // Tìm comment gốc
            const commentToDelete = state.comments[postId].find(
              (comment) => comment.id === commentId
            );

            if (commentToDelete) {
              deletedCount = 1 + (commentToDelete.replies?.length || 0); // Tính tổng số comment bị xóa
            }

            // Xóa comment gốc
            state.comments[postId] = state.comments[postId].filter(
              (comment) => comment.id !== commentId
            );
          } else {
            // Nếu là reply, tìm trong tất cả comments
            state.comments[postId] = state.comments[postId].map((comment) => {
              const newReplies = comment.replies.filter(
                (reply) => reply.id !== commentId
              );

              if (newReplies.length < comment.replies.length) {
                deletedCount = 1; // Chỉ xóa 1 reply
              }

              return { ...comment, replies: newReplies };
            });
          }

          // ✅ Cập nhật chính xác số lượng comment trong posts
          const postIndex = state.posts.findIndex((post) => post.id === postId);
          if (postIndex !== -1 && state.posts[postIndex].commentCount > 0) {
            state.posts[postIndex].commentCount = Math.max(
              0,
              state.posts[postIndex].commentCount - deletedCount
            );
          }
        }
      })

      .addCase(replyComments.fulfilled, (state, action) => {
        const { postId, data, userId } = action.payload;
        if (!data) return;
        const { parentCommentId } = data;

        if (!state.comments[postId]) return;

        const newReply = {
          id: data.commentId,
          userId: userId, // Thay bằng user hiện tại
          userName: data.fullName,
          profilePicture: data.profilePicture,
          content: data.content,
          createdAt: data.createdAt,
          hasLiked: 0,
          likeCountComment: 0,
          replies: [],
          hasMoreReplies: false,
          parentCommentId: parentCommentId,
        };

        // Tìm comment gốc
        const postComment = state.comments[postId];
        const rootComment = postComment.find(
          (comment) => comment.id === parentCommentId
        );

        if (rootComment) {
          rootComment.replies.push(newReply);
        }
        // Cập nhật số lượng bình luận trong bài post
        const postIndex = state.posts.findIndex((post) => post.id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentCount += 1;
        }
      })
      //listpostReduucers
      .addCase(sharePost.fulfilled, (state, action) => {
        console.log("chia se");
        const newPost = {
          ...action.payload,
          // Đảm bảo cấu trúc phù hợp với hệ thống hiện tại
          hasLiked: false,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          postType: 1, // Loại shared post
        };

        // Thêm vào đầu danh sách
        state.posts.unshift(newPost);

        // Tăng shareCount cho bài gốc nếu có
        if (newPost.originalPost?.postId) {
          const originalPost = state.posts.find(
            (p) => p.id === newPost.originalPost.postId
          );
          if (originalPost) originalPost.shareCount += 1;
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
  openCommentOption,
  closeCommentOption,
} = listPostSlice.actions;

export default listPostSlice.reducer;
