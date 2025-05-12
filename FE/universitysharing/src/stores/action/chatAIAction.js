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
  async ({ endpoint, params, redis_key, conversationId, chatHistoryId, successMessage }, { rejectWithValue }) => {
    try {
      let dataToSend = null;
      let config = {};
      let method = 'post';
      let url = endpoint;

      console.log('[confirmAction] Received params:', JSON.stringify(params, null, 2));

      // Đảm bảo params là object, không phải mảng
      let normalizedParams = params;
      if (Array.isArray(params)) {
        console.warn('[confirmAction] Params is an array, taking first element:', params);
        if (params.length === 0 || Object.keys(params[0]).length === 0) {
          console.error('[confirmAction] Invalid params: empty array or empty object');
          throw new Error('Invalid params: empty array or empty object');
        }
        normalizedParams = params[0];
      }

      // Kiểm tra params có phải object hợp lệ không
      if (!normalizedParams || typeof normalizedParams !== 'object') {
        console.error('[confirmAction] Invalid params: not an object', normalizedParams);
        throw new Error('Invalid params: not an object');
      }

      // Tạo jsonParams từ normalizedParams, loại bỏ giá trị null/undefined/'null'
      let jsonParams = Object.entries(normalizedParams).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== 'null') {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Kiểm tra các trường bắt buộc cho /api/Ride/create
      if (endpoint.includes('/api/Ride/create')) {
        if (!jsonParams.driverId || !jsonParams.ridePostId) {
          console.error('[confirmAction] Missing required fields:', jsonParams);
          throw new Error('Missing required fields: driverId or ridePostId');
        }
      }

      console.log('[confirmAction] Prepared jsonParams:', JSON.stringify(jsonParams, null, 2));

      // Xác định phương thức HTTP phù hợp
      if (
        endpoint.includes('/UserProfile/upProfile') ||
        endpoint.includes('/Comment/UpdateComment') ||
        endpoint.includes('/UserProfile/upInformation')
      ) {
        method = 'put';
      } else if (endpoint.includes('/Post/update-post')) {
        method = 'patch';
      } else if (endpoint.includes('/Post/delete')) {
        method = 'delete';
      } else if (endpoint.includes('/Comment/DeleteComment')) {
        method = 'patch';
      }

      // Xử lý {placeholder} trong URL
      if (url.includes('{')) {
        Object.entries(jsonParams).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          if (url.includes(placeholder)) {
            url = url.replace(placeholder, encodeURIComponent(value));
          }
        });
      }

      // Gửi dữ liệu dạng FormData nếu có upload
      if (
        endpoint.includes('/Post/create') ||
        endpoint.includes('/Post/update-post') ||
        endpoint.includes('/UserProfile/upProfile')
      ) {
        const formData = new FormData();
        Object.entries(jsonParams).forEach(([key, value]) => {
          console.log('[confirmAction] Processing param:', { key, value });
          if (key === 'Images' && value && value !== 'null' && Array.isArray(value)) {
            for (const img of value) {
              formData.append('Images', img);
            }
          } else if (key === 'Video' && value && value !== 'null') {
            formData.append('Video', value);
          } else if (value !== null && value !== undefined && value !== 'null') {
            formData.append(key, value.toString());
          }
        });
        formData.append('redis_key', redis_key);
        dataToSend = formData;
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else if (method === 'delete' || (method === 'patch' && !endpoint.includes('/Post/update-post'))) {
        dataToSend = null;
        const queryParams = Object.entries(jsonParams).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined && value !== 'null') {
            acc[key] = value;
          }
          return acc;
        }, {});
        config.params = { ...queryParams, redis_key };
      } else {
        dataToSend = jsonParams;
        config.headers = { 'Content-Type': 'application/json' };
      }

      console.log('[confirmAction] Sending dataToSend:', JSON.stringify(dataToSend, null, 2));

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
      console.log('[confirmAction] rediskey:', redis_key);

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
