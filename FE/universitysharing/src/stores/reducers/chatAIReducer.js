import { createSlice } from '@reduxjs/toolkit';
import { fetchConversations, fetchChatHistory, sendQuery, createNewConversation, connectSignalR, receiveMessage, clearConversation, setError } from '../action/ChatAI';

const initialState = {
  conversations: [],
  currentConversation: {
    conversationId: null,
    title: '',
    messages: []
  },
  status: 'idle',
  error: null
};

const chatAISlice = createSlice({
  name: 'chatAI',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(clearConversation, (state) => {
        state.currentConversation = initialState.currentConversation;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(setError, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.status = 'idle';
        const newConversations = action.payload.map(conv => ({
          conversationId: conv.conversationId,
          title: conv.title,
          createdAt: conv.createdAt || new Date().toISOString()
        }));
        state.conversations = [
          ...state.conversations.filter(c => !newConversations.some(nc => nc.conversationId === c.conversationId)),
          ...newConversations
        ];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = { type: 'api', message: action.payload };
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.status = 'idle';
        const { conversationId, title, chatHistories } = action.payload;
        state.currentConversation = {
          conversationId,
          title,
          messages: chatHistories.length > 0 ? chatHistories.map(msg => ({
            id: msg.id,
            role: msg.query ? 'user' : 'assistant',
            content: msg.query || msg.answer,
            timestamp: msg.timestamp,
            isFinal: true
          })).slice(-10) : [] // Xử lý chatHistories rỗng
        };
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = { type: 'api', message: action.payload || 'Lỗi khi lấy lịch sử chat' };
      })
      .addCase(createNewConversation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNewConversation.fulfilled, (state, action) => {
        state.status = 'idle';
        const { conversationId, title, messages = [] } = action.payload;
        state.currentConversation = {
          conversationId,
          title,
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.query ? 'user' : 'assistant',
            content: msg.query || msg.answer,
            timestamp: msg.timestamp,
            isFinal: true
          }))
        };
        if (!state.conversations.some(c => c.conversationId === conversationId)) {
          state.conversations.push({ conversationId, title, createdAt: new Date().toISOString() });
        }
      })
      .addCase(createNewConversation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = { type: 'api', message: action.payload || 'Lỗi khi tạo hội thoại mới' };
      })
      .addCase(sendQuery.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(sendQuery.fulfilled, (state, action) => {
        state.status = 'streaming';
        const { conversationId, query } = action.payload;
        state.currentConversation.conversationId = conversationId;
        state.currentConversation.messages.push({
          id: `${conversationId}-${Date.now()}`,
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
          isFinal: true
        });
        if (state.currentConversation.messages.length > 10) {
          state.currentConversation.messages = state.currentConversation.messages.slice(-10);
        }
      })
      .addCase(sendQuery.rejected, (state, action) => {
        state.status = 'failed';
        state.error = { type: 'api', message: action.payload };
      })
      .addCase(connectSignalR.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(connectSignalR.fulfilled, (state, action) => {
        console.log('[chatAIReducer] connectSignalR.fulfilled:', action.payload);
        state.status = 'idle'; // Luôn đặt về 'idle' sau khi join/leave SignalR
      })
      .addCase(receiveMessage, (state, action) => {
        console.log('[chatAIReducer] receiveMessage:', action.payload);
        const { id, role, content, timestamp, isFinal } = action.payload;
        if (role !== 'assistant') return;
      
        const existingMessageIndex = state.currentConversation.messages.findIndex(m => m.role === 'assistant' && !m.isFinal);
        if (existingMessageIndex >= 0 && !isFinal) {
          state.currentConversation.messages[existingMessageIndex].content += content;
          state.currentConversation.messages[existingMessageIndex].timestamp = timestamp;
        } else {
          state.currentConversation.messages.push({
            id,
            role,
            content,
            timestamp,
            isFinal
          });
          if (state.currentConversation.messages.length > 10) {
            state.currentConversation.messages = state.currentConversation.messages.slice(-10);
          }
        }
        state.status = isFinal ? 'idle' : 'streaming'; // Chỉ đặt 'streaming' khi nhận tin nhắn chưa hoàn tất
      });
  }
});

export default chatAISlice.reducer;