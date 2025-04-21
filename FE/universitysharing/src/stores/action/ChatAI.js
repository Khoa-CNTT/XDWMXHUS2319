import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import axiosClient from '../../Service/axiosClient';

// Action để nhận tin nhắn từ SignalR
export const receiveMessage = createAction('chatAI/receiveMessage');

// Action để đặt lỗi thủ công
export const setError = createAction('chatAI/setError');

// Action để xóa hội thoại hiện tại
export const clearConversation = createAction('chatAI/clearConversation');

// Async thunk để lấy danh sách hội thoại
export const fetchConversations = createAsyncThunk(
  'chatAI/fetchConversations',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/api/ChatAI/conversations', {
        params: { userId },
      });
      if (!response.data.success) {
        console.error('[fetchConversations] Server error:', response.data.message);
        return rejectWithValue(response.data.message || 'Lỗi khi lấy danh sách hội thoại');
      }
      return response.data.data.conversations;
    } catch (error) {
      console.error('[fetchConversations] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách hội thoại');
    }
  }
);

// Async thunk để lấy lịch sử chat
export const fetchChatHistory = createAsyncThunk(
  'chatAI/fetchChatHistory',
  async ({ userId, conversationId, lastMessageId = null, pageSize = 10 }, { getState, rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/api/ChatAI/conversation/${conversationId}`, {
        params: { userId, lastMessageId, pageSize },
      });
      console.log('[fetchChatHistory] Server response:', response.data);
      if (!response.data.success) {
        console.error('[fetchChatHistory] Server error:', response.data.message);
        return rejectWithValue(response.data.message || 'Lỗi khi lấy lịch sử chat');
      }
      if (!response.data.data) {
        console.error('[fetchChatHistory] Invalid response data:', response.data);
        return rejectWithValue('Dữ liệu lịch sử chat không hợp lệ');
      }
      // Lấy title từ danh sách hội thoại trong state
      const { conversations } = getState().chatAI;
      const conversation = conversations.find(c => c.conversationId === conversationId);
      const title = conversation?.title || 'Trò chuyện mới';
      return {
        conversationId,
        title,
        chatHistories: response.data.data.chatHistories || [],
        nextCursor: response.data.data.nextCursor
      };
    } catch (error) {
      console.error('[fetchChatHistory] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy lịch sử chat');
    }
  }
);

// Async thunk để gửi truy vấn
export const sendQuery = createAsyncThunk(
  'chatAI/sendQuery',
  async ({ query, userId, conversationId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('http://localhost:5000/api/query', { query, user_id: userId, conversation_id: conversationId });
      if (!response.data.conversation_id) {
        console.error('[sendQuery] Server error:', response.data.error);
        return rejectWithValue(response.data.error || 'Lỗi khi gửi truy vấn');
      }
      return { conversationId: response.data.conversation_id, query };
    } catch (error) {
      console.error('[sendQuery] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || 'Lỗi khi gửi truy vấn');
    }
  }
);

// Async thunk để tạo hội thoại mới
export const createNewConversation = createAsyncThunk(
  'chatAI/createNewConversation',
  async ({ userId, title = "Trò chuyện mới" }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/api/ChatAI/create-new-conversation', { userId, title });
      console.log('[createNewConversation] Server response:', response.data);
      if (!response.data.success) {
        console.error('[createNewConversation] Server error:', response.data.message);
        return rejectWithValue(response.data.message || 'Lỗi khi tạo hội thoại mới');
      }
      if (!response.data.data || !response.data.data.conversationId) {
        console.error('[createNewConversation] Invalid response data:', response.data);
        return rejectWithValue('Dữ liệu hội thoại không hợp lệ');
      }
      return response.data.data;
    } catch (error) {
      console.error('[createNewConversation] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo hội thoại mới');
    }
  }
);
// Async thunk để quản lý kết nối SignalR
export const connectSignalR = createAsyncThunk(
  'chatAI/connectSignalR',
  async ({ conversationId, action, signalRService }, { dispatch, rejectWithValue }) => {
    console.log('[connectSignalR] Kiểm tra SignalR:', {
      conversationId,
      action,
      signalRService: !!signalRService,
      aiConnection: !!signalRService?.aiConnection
    });

    if (!signalRService) {
      console.error('[connectSignalR] SignalR service không tồn tại');
      return rejectWithValue('SignalR service không tồn tại');
    }
    if (!signalRService.aiConnection) {
      console.error('[connectSignalR] aiConnection không tồn tại. Trạng thái:', {
        isInitialized: signalRService.isInitialized,
        isConnected: signalRService.isConnected
      });
      return rejectWithValue('aiConnection không tồn tại');
    }

    try {
      if (action === 'join') {
        console.log('[connectSignalR] Tham gia nhóm:', conversationId);
        await signalRService.joinConversationAI(conversationId);
        signalRService.onReceiveAnswer((data, isFinal) => {
          console.log('[connectSignalR] Đăng ký ReceiveAnswer cho:', conversationId);
          dispatch(receiveMessage({
            id: `${conversationId}-${Date.now()}`,
            role: 'assistant',
            content: data,
            timestamp: new Date().toISOString(),
            isFinal
          }));
        });
        return { conversationId, action: 'join' };
      } else if (action === 'leave') {
        console.log('[connectSignalR] Rời nhóm:', conversationId);
        await signalRService.leaveConversationAI(conversationId);
        signalRService.off('ReceiveAnswer', signalRService.aiConnection);
        return { conversationId, action: 'leave' };
      }
      console.error('[connectSignalR] Hành động không hợp lệ:', action);
      return rejectWithValue('Hành động SignalR không hợp lệ');
    } catch (error) {
      console.error('[connectSignalR] Lỗi khi thực hiện hành động SignalR:', {
        action,
        conversationId,
        error: error.message
      });
      return rejectWithValue(`Lỗi khi ${action === 'join' ? 'tham gia' : 'rời'} SignalR: ${error.message}`);
    }
  }
);