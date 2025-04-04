import { createSlice } from "@reduxjs/toolkit";
import {
  addCommentPost,
  commentPost,
  fetchPosts,
  likePost,
  likeComment,
  createPost,
  deletePost,
  getReplyComment,
  deleteComments,
  replyComments,
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
    loading: false,
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
        const { postId, comments } = action.payload;
        state.comments[postId] = comments;
      }) //Lấy bình luận thuần kiểu có gì nhận nấy

      //Đưa các bình luận cấp 3+ lên trên cấp 2
      // .addCase(commentPost.fulfilled, (state, action) => {
      //   const { postId, comments } = action.payload;

      //   let newComments = [];

      //   comments.forEach((comment) => {
      //     // Tạo một bản sao bình luận cấp 1, nhưng xóa replies để tự xử lý lại
      //     let parentComment = { ...comment, replies: [] };

      //     let level2Replies = []; // Lưu danh sách cấp 2

      //     comment.replies.forEach((reply) => {
      //       // Nếu reply có replies con (cấp 3+), đẩy chúng ra cùng cấp 2
      //       let extractedReplies = reply.replies.map((subReply) => ({
      //         ...subReply,
      //         parentCommentId: comment.id, // Đưa lên thành cấp 2
      //       }));

      //       // Tạo bình luận cấp 2, xóa replies vì đã tách riêng
      //       let childComment = { ...reply, replies: [] };

      //       level2Replies.push(childComment, ...extractedReplies);
      //     });

      //     // Gán lại danh sách replies (chỉ có cấp 2)
      //     parentComment.replies = level2Replies;

      //     // Đưa bình luận cấp 1 vào danh sách chính
      //     newComments.push(parentComment);
      //   });

      //   // Cập nhật state
      //   state.comments[postId] = newComments;
      // })

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
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
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

      // .addCase(deleteComments.fulfilled, (state, action) => {
      //   const { postId, commentId } = action.payload;

      //   // Xóa comment trong danh sách comments
      //   if (state.comments[postId]) {
      //     // Kiểm tra xem commentId là comment gốc hay reply
      //     const isRootComment = state.comments[postId].some(
      //       (comment) => comment.id === commentId
      //     );

      //     if (isRootComment) {
      //       // Nếu là comment gốc, xóa bình thường
      //       state.comments[postId] = state.comments[postId].filter(
      //         (comment) => comment.id !== commentId
      //       );
      //     } else {
      //       // Nếu là reply, duyệt qua tất cả comments để xóa
      //       state.comments[postId] = state.comments[postId].map((comment) => {
      //         return {
      //           ...comment,
      //           replies: comment.replies.filter(
      //             (reply) => reply.id !== commentId
      //           ),
      //         };
      //       });
      //     }
      //   }

      //   // Cập nhật số lượng commentCount trong posts
      //   const postIndex = state.posts.findIndex((post) => post.id === postId);
      //   if (postIndex !== -1 && state.posts[postIndex].commentCount > 0) {
      //     state.posts[postIndex].commentCount -= 1;
      //   }
      // })

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
