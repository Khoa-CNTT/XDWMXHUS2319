import axios from "axios";

const API_URL = "https://localhost:7053/api/Message";

const getToken = () => localStorage.getItem("token");

export const getConversation = async (friendId) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.get(`${API_URL}/conversations/single?user2Id=${friendId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy/tạo cuộc trò chuyện:", error);
    throw error.response?.data?.message || "Không thể lấy cuộc trò chuyện";
  }
};

export const getConversations = async () => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.get(`${API_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
    throw error.response?.data?.message || "Không thể lấy danh sách cuộc trò chuyện";
  }
};

export const getMessages = async (conversationId, nextCursor = null, pageSize = 20) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const url = `${API_URL}/conversations/${conversationId}/messages?pageSize=${pageSize}${
      nextCursor ? `&nextCursor=${nextCursor}` : ""
    }`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error);
    throw error.response?.data?.message || "Không thể lấy danh sách tin nhắn";
  }
};

export const sendMessage = async (messageDto) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.post(`${API_URL}/send`, messageDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw error.response?.data?.message || "Không thể gửi tin nhắn";
  }
};

export const markMessageAsSeen = async (messageId, conversationId) => {
  const token = getToken();
  if (!token) throw new Error("Không có token");

  try {
    const response = await axios.patch(
      `${API_URL}/${messageId}/seen?conversationId=${conversationId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    throw error.response?.data?.message || "Không thể đánh dấu tin nhắn đã đọc";
  }
};