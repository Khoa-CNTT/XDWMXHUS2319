import { createReducer } from '@reduxjs/toolkit';
import { fetchChatHistory, fetchConversations, sendQuery } from '../action/chatAIAction';

const initialState = {
  conversations: [],
  currentConversation: null,
  chatHistory: [],
  nextCursor: null,
  isLoading: false,
  error: null,
  currentConversationId: null,
};

export const chatAIReducer = createReducer(initialState, (builder) => {
  builder
    // Fetch Conversations
    .addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      const { conversations, nextCursor } = action.payload;
      state.conversations = action.meta.arg.lastConversationId
        ? [...state.conversations, ...conversations]
        : conversations;
      state.nextCursor = nextCursor || null;
    })
    .addCase(fetchConversations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Lỗi khi lấy danh sách hội thoại';
    })
    // Fetch Chat History
    .addCase(fetchChatHistory.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      if (action.meta.arg.conversationId !== state.currentConversationId) {
        state.chatHistory = [];
        state.currentConversationId = action.meta.arg.conversationId;
      }
    })
    .addCase(fetchChatHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      const { chatHistories, nextCursor, conversationId } = action.payload;
    
      if (conversationId === state.currentConversationId) {
        state.chatHistory = action.meta.arg.lastMessageId
          ? [...state.chatHistory, ...chatHistories]
          : chatHistories;
        state.nextCursor = nextCursor || null;
      }
    }
    )
    .addCase(fetchChatHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Lỗi khi lấy lịch sử chat';
    })
    // Send Query
    .addCase(sendQuery.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(sendQuery.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentConversation = action.payload;
      state.currentConversationId = action.payload.conversationId;
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.conversationId === action.payload.conversationId
      );
      if (conversationIndex >= 0) {
        state.conversations[conversationIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    })
    .addCase(sendQuery.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Lỗi khi gửi truy vấn';
    })
    // Add Local Message
    .addCase('chatAI/ADD_LOCAL_MESSAGE', (state, action) => {
      const { conversationId, query, answer, timestamp } = action.payload;
      if (conversationId === state.currentConversationId) {
        state.chatHistory.push({
          id: `msg-${Date.now()}`,
          query,
          answer,
          timestamp,
        });
      }
    });
});