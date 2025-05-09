import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../Service/axiosClient';

// Async thunk để gửi truy vấn
export const sendQuery = createAsyncThunk(
  'chatAI/sendQuery',
  async ({ query, conversationId }, { rejectWithValue }) => {
    try {
      let newConversationId = conversationId;

      // Nếu không có conversationId, tạo conversation mới
      if (!conversationId) {
        const createResponse = await axiosClient.post('/api/ChatAI/create-new-conversation', {});
        const createData = createResponse.data;

        console.log('[sendQuery] Create conversation response:', createData);

        if (createData.code !== 200 || !createData.data) {
          return rejectWithValue(createData.message || 'Lỗi khi tạo conversation mới');
        }

        newConversationId = createData.data.conversationId;
      }

      // Trả về conversationId để gửi query qua SignalR
      return {
        conversationId: newConversationId,
        query
      };
    } catch (error) {
      console.error('[sendQuery] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi gửi truy vấn');
    }
  }
);

// Async thunk để lấy danh sách hội thoại
export const fetchConversations = createAsyncThunk(
  'chatAI/fetchConversations',
  async ({ lastConversationId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/api/ChatAI/conversations', {
        params: { lastConversationId },
      });
      console.log('[fetchConversations] Response:', response.data);
      const resData = response.data;
      if (resData.code !== 200 || !resData.data) {
        return rejectWithValue(resData.message || 'Lỗi khi lấy danh sách hội thoại');
      }
      console.log('[fetchConversations] Returning data:', resData.data);
      return resData.data;
    } catch (error) {
      console.error('[fetchConversations] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách hội thoại');
    }
  }
);

// Async thunk để lấy lịch sử chat
export const fetchChatHistory = createAsyncThunk(
  'chatAI/fetchChatHistory',
  async ({ conversationId, lastMessageId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/api/ChatAI/conversation/${conversationId}`, {
        params: { lastConversationId: lastMessageId },
      });
      console.log('[fetchChatHistory] Response:', response.data);
      const resData = response.data;
      if (resData.code !== 200 || !resData.data) {
        return rejectWithValue(resData.message || 'Lỗi khi lấy lịch sử chat');
      }
      console.log('[fetchChatHistory] Returning data:', resData.data);
      return {
        ...resData.data,
        conversationId, // ← Thêm dòng này để reducer nhận được
      };
    } catch (error) {
      console.error('[fetchChatHistory] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy lịch sử chat');
    }
  }
);
export const confirmAction = createAsyncThunk(
  'chatAI/confirmAction',
  async ({ endpoint, params, redis_key, conversationId, chatHistoryId,successMessage }, { rejectWithValue }) => {
    try {
      let dataToSend = null;
      let config = {};
      let method = 'post';
      let url = endpoint;

      console.log('[confirmAction] Received params:', JSON.stringify(params, null, 2));

      // Chuẩn hóa params thành mảng
      const normalizedParams = Array.isArray(params) ? params : [params];

      // Xác định phương thức HTTP phù hợp
      if (
        endpoint.includes('/Post/update-post') ||
        endpoint.includes('/UserProfile/upProfile') ||
        endpoint.includes('/Comment/UpdateComment')
      ) {
        method = 'put';
      } else if (endpoint.includes('/Post/delete')) {
        method = 'delete';
      } else if (endpoint.includes('/Comment/DeleteComment')) {
        method = 'patch';
      }

      // Xử lý {placeholder} trong URL
      if (url.includes('{')) {
        normalizedParams.forEach((paramObj) => {
          Object.entries(paramObj).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            if (url.includes(placeholder)) {
              url = url.replace(placeholder, encodeURIComponent(value));
            }
          });
        });
      }

      // Gửi dữ liệu dạng FormData nếu có upload
      if (
        endpoint.includes('/Post/create') ||
        endpoint.includes('/Post/update-post') ||
        endpoint.includes('/UserProfile/upProfile')
      ) {
        const formData = new FormData();
        normalizedParams.forEach((paramObj) => {
          Object.entries(paramObj).forEach(([key, value]) => {
            console.log('[confirmAction] Processing param:', { key, value });
            if (key === 'Images' && value && value !== 'null' && Array.isArray(value)) {
              for (const img of value) {
                formData.append('Images', img);
              }
            } else if (key === 'Video' && value && value !== 'null') {
                formData.append('Video', value);
            } else if (value !== null && value !== undefined && value !== 'null') {
                formData.append(key, value);
            }
          });
        });
        formData.append('redis_key', redis_key);
        dataToSend = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else if (method === 'delete' || method === 'patch') {
        dataToSend = null;
        const queryParams = normalizedParams.reduce((acc, paramObj) => {
          Object.entries(paramObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== 'null') {
              acc[key] = value;
            }
          });
          return acc;
        }, {});
        config.params = { ...queryParams, redis_key };
      } else {
        const jsonParams = normalizedParams.reduce((acc, paramObj) => {
          Object.entries(paramObj).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== 'null') {
              acc[key] = value;
            }
          });
          return acc;
        }, {});
        dataToSend = {
          ...jsonParams,
          redis_key,
        };
        config.headers = { 'Content-Type': 'application/json' };
      }

      // Gửi request tới endpoint
      let response;
      if (method === 'post') {
        response = await axiosClient.post(url, dataToSend, config);
      } else if (method === 'put') {
        response = await axiosClient.put(url, dataToSend, config);
      } else if (method === 'patch') {
        response = await axiosClient.patch(url, dataToSend, config);
      } else if (method === 'delete') {
        response = await axiosClient.delete(url, config);
      }

      // Gửi successMessage và chatHistoryId về BE để cập nhật AIChatHistory
      const updateResponse = await axiosClient.post(`/api/ChatAI/update-message`, {
        chatHistoryId,
        successMessage,
      });

      console.log('[confirmAction] Request sent successfully:', response.data);
      console.log('[confirmAction] Update message response:', updateResponse.data);

      return {
        conversationId,
        response: response.data,
        successMessage,
      };
    } catch (error) {
      console.error('[confirmAction] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xác nhận hành động');
    }
  }
);
// Async thunk để hủy hành động
export const stopAction = createAsyncThunk(
  'chatAI/stopAction',
  async ({ redis_key }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/api/ChatAI/stop-action', { redis_key: redis_key });
      console.log('[stopAction] Response:', response.data);
      const resData = response.data;
      if (resData.status !== 200) {
        return rejectWithValue(resData.message || 'Lỗi khi hủy hành động');
      }
      console.log('[stopAction] Action stopped successfully');
      return resData;
    } catch (error) {
      console.error('[stopAction] Error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi hủy hành động');
    }
  }
);
