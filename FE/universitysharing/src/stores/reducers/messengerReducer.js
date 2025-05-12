import { createSlice } from "@reduxjs/toolkit";
import {
  getMessagess,
  sendMessage,
  getConversationss,
  getInbox,
  sendMessages,
} from "../action/messageAction";

const messenger = createSlice({
  name: "messenger",
  initialState: {
    // messages: null,
    messages: [],
    nextCursor: null,
    conversation: null,
    conversationId: null,
    selectFriend: null,
    inboxRead: null,
    unReadInbox: null,
  },
  reducers: {
    resetMessages: (state) => {
      state.messages = [];
      state.nextCursor = null;
    },
    setSelectFriend: (state, action) => {
      state.selectFriend = action.payload;
    },
    addMessage: (state, action) => {
      const newMsg = action.payload;
      // const existsSelectedUser = state.selectFriend.some(
      //   (m) => m.friendId === newMsg.senderId
      // );
      const exists = state.messages.some((m) => m.id === newMsg.id);
      if (!exists) {
        state.messages.push(newMsg);
      }
    },
    markInboxAsSeen: (state, action) => {
      const { friendId } = action.payload;
      // console.warn("Id nhắn ", friendId);

      // Xóa conversationId trong unReadInbox
      if (state.unReadInbox) {
        delete state.unReadInbox[friendId];
      }
    },
    updateInboxOnNewMessage: (state, action) => {
      const newMsg = action.payload;
      const senderId = newMsg.senderId;

      // Bỏ qua nếu tin nhắn từ cuộc trò chuyện hiện tại
      if (newMsg.conversationId === state.conversationId) {
        console.warn("🛑 Tin nhắn từ cuộc trò chuyện hiện tại, bỏ qua.");
        return;
      }

      // 🛠️ Kiểm tra trùng ID trong inboxRead (ngăn lặp)
      if (state.inboxRead) {
        const userIndex = state.inboxRead.findIndex(
          (item) => item.user.id === senderId
        );
        if (userIndex !== -1) {
          const userItem = state.inboxRead[userIndex];
          if (userItem.id === newMsg.id) {
            console.warn("🛑 Tin nhắn đã tồn tại trong inboxRead, bỏ qua.");
            return;
          }

          // Cập nhật thông tin mới cho inboxRead
          userItem.id = newMsg.id;
          userItem.lastMessage = newMsg.content;
          userItem.lastMessageDate = newMsg.sentAt;
          userItem.unreadCount += 1;
          userItem.isSeen = false;

          // Đưa người dùng lên đầu danh sách
          state.inboxRead.splice(userIndex, 1);
          state.inboxRead.unshift(userItem);
        }
      }

      // Update unReadInbox
      if (!state.unReadInbox) state.unReadInbox = {};
      if (state.unReadInbox[senderId]) {
        state.unReadInbox[senderId] += 1;
      } else {
        state.unReadInbox[senderId] = 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(getMessagess.fulfilled, (state, action) => {
      //   const newMessages = action.payload.data || [];
      //   const isLoadMore = !!action.payload.append;

      //   // Nếu append thì nối vào đầu danh sách (tin nhắn cũ), ngược lại thì replace
      //   state.messages = isLoadMore
      //     ? [...newMessages, ...state.messages]
      //     : newMessages;

      //   state.nextCursor = action.payload.nextCursor || null;
      // })
      .addCase(getMessagess.fulfilled, (state, action) => {
        const newMessages = action.payload.data || [];
        const isLoadMore = !!action.payload.append;

        // Nếu append thì nối vào đầu danh sách (tin nhắn cũ), ngược lại thì thay thế
        if (isLoadMore) {
          // Lọc ra những tin nhắn chưa có trong state.messages (dựa trên id)
          const uniqueMessages = newMessages.filter(
            (newMsg) =>
              !state.messages.some(
                (existingMsg) => existingMsg.id === newMsg.id
              )
          );
          state.messages = [...uniqueMessages, ...state.messages];
        } else {
          // Nếu không append thì chỉ thay thế tin nhắn hiện tại, vẫn loại bỏ tin nhắn trùng
          const uniqueMessages = newMessages.filter(
            (newMsg) =>
              !state.messages.some(
                (existingMsg) => existingMsg.id === newMsg.id
              )
          );
          state.messages = uniqueMessages;
        }

        state.nextCursor = action.payload.nextCursor || null;
      })

      .addCase(getConversationss.fulfilled, (state, action) => {
        // state.conversation = action.payload;
        state.conversationId = action.payload.id;
      })
      .addCase(getInbox.fulfilled, (state, action) => {
        // state.inboxRead = action.payload.conversations;
        state.inboxRead = action.payload.conversations.map((conversation) => ({
          ...conversation,
          id: null, // Thêm id từ user hoặc để null
        }));
        state.unReadInbox = action.payload.unreadCounts;
      });
    // .addCase(sendMessages.fulfilled, (state, action) => {
    //   state.messages.push(action.payload); // hoặc xử lý phù hợp
    // });
  },
});
export const {
  resetMessages,
  setSelectFriend,
  addMessage,
  markInboxAsSeen,
  updateInboxOnNewMessage,
} = messenger.actions;
export default messenger.reducer;
