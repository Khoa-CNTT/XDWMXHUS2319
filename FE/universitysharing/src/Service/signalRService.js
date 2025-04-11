import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.retryInterval = 5000; // Thời gian retry (ms)
    this.maxRetries = 3; // Số lần retry tối đa
  }

  async startConnection(token) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7053/chatHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => this.retryInterval,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        await this.connection.start();
        console.log("Kết nối SignalR thành công");
        return;
      } catch (err) {
        retries++;
        console.error(`Lỗi kết nối SignalR (lần ${retries}):`, err);
        if (retries === this.maxRetries) {
          throw new Error("Không thể kết nối SignalR sau nhiều lần thử");
        }
        await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
      }
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("Ngắt kết nối SignalR thành công");
      } catch (err) {
        console.error("Lỗi khi ngắt kết nối SignalR:", err);
      } finally {
        this.connection = null;
      }
    }
  }

  async invoke(methodName, ...args) {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Không thể gọi ${methodName}: Kết nối SignalR chưa sẵn sàng`);
    }
    try {
      await this.connection.invoke(methodName, ...args);
    } catch (err) {
      console.error(`Lỗi khi gọi ${methodName}:`, err);
      throw err;
    }
  }

  async joinConversation(conversationId) {
    await this.invoke("JoinConversation", conversationId);
  }

  async leaveConversation(conversationId) {
    await this.invoke("LeaveConversation", conversationId);
  }

  async sendMessage(conversationId, message) {
    await this.invoke("SendMessageToConversation", conversationId, message);
  }



  async markMessageAsSeen(conversationId, messageId) {
    await this.invoke("MarkMessageAsSeen", conversationId, messageId);
  }

  async sendTyping(conversationId) {
    await this.invoke("SendTyping", conversationId);
  }

  on(eventName, callback) {
    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  off(eventName, callback) {
    if (this.connection) {
      this.connection.off(eventName, callback);
    }
  }

  // Đăng ký sự kiện cụ thể
  onReceiveMessage(callback) {
    this.on("ReceiveMessage", callback);
  }

  onMessageDelivered(callback) {
    this.on("MessageDelivered", callback);
  }

  onMessageSeen(callback) {
    this.on("MessageSeen", callback);
  }

  onUserTyping(callback) {
    this.on("UserTyping", callback);
  }
  onInitialOnlineUsers(callback) {
    this.on("InitialOnlineUsers", callback);
  }
  onUserOnline(callback) {
    this.on("UserOnline", callback);
  }

  onUserOffline(callback) {
    this.on("UserOffline", callback);
  }
}

export default new SignalRService();