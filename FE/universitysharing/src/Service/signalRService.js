// src/services/signalService.js
import * as signalR from "@microsoft/signalr";
import { refreshAccessToken } from "./authService";
import { message } from "antd";

class SignalRService {
  constructor() {
    if (SignalRService.instance) {
      return SignalRService.instance;
    }

    this.notificationConnection = null;
    this.chatConnection = null;
    this.isInitialized = false; // Xóa trùng lặp
    this.keepAliveInterval = null;
    this.maxRetries = 5;
    this.retryInterval = 5000;
    this.baseUrl = process.env.REACT_APP_BASE_URL;
    this.eventListeners = new Map(); // Lưu trữ sự kiện để cleanup
    this.eventQueue = { chatHub: [], notificationHub: [] }; // Thêm hàng đợi sự kiện
    SignalRService.instance = this;
  }

  initializeConnections(token) {
    console.log("[SignalRService] Khởi tạo SignalR connections...");
    try {
      if (!this.notificationConnection) {
        this.notificationConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${this.baseUrl}/notificationHub`, {
            accessTokenFactory: () => token,
            withCredentials: true,
          })
          .configureLogging(signalR.LogLevel.Debug)
          .withAutomaticReconnect([0, 2000, 5000, 10000])
          .build();
      }

      if (!this.chatConnection) {
        this.chatConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${this.baseUrl}/chatHub`, {
            accessTokenFactory: () => token,
            withCredentials: true,
          })
          .configureLogging(signalR.LogLevel.Debug)
          .withAutomaticReconnect([0, 2000, 5000, 10000])
          .build();
      }

      this.setupErrorHandling();
      this.isInitialized = true;
      console.log("[SignalRService] Đã khởi tạo kết nối SignalR");
    } catch (err) {
      console.error("[SignalRService] Lỗi khởi tạo kết nối:", err);
      this.notificationConnection = null;
      this.chatConnection = null;
      this.isInitialized = false;
      throw err;
    }
  }

  // Thêm phương thức để cập nhật token mới
  updateToken(token) {
    if (!this.notificationConnection || !this.chatConnection) {
      console.warn("[SignalRService] Kết nối chưa khởi tạo, không thể cập nhật token");
      return;
    }

    this.notificationConnection.accessTokenFactory = () => token;
    this.chatConnection.accessTokenFactory = () => token;
    console.log("[SignalRService] Đã cập nhật token mới cho SignalR");
  }

  // Xử lý lỗi kết nối (bao gồm 401)
  setupErrorHandling() {
    const connections = [
      { name: "notification", connection: this.notificationConnection },
      { name: "chat", connection: this.chatConnection },
    ];
  
    connections.forEach(({ name, connection }) => {
      if (!connection) {
        console.warn(`[SignalRService] Kết nối ${name} là null`);
        return;
      }
  
      // Sửa: Chỉ đăng ký onclose một lần, không lồng
      connection.onclose(async (error) => {
        console.error(`[SignalRService] Kết nối ${name} bị đóng:`, {
          message: error?.message,
          status: error?.status,
        });
        this.isConnected = false; // Reset trạng thái
  
        if (error?.message?.includes("401")) {
          console.warn(`[SignalRService] Token hết hạn cho ${name}, đang làm mới...`);
          try {
            const newToken = await refreshAccessToken();
            this.updateToken(newToken);
            await connection.start();
            this.isConnected = true; // Sửa: Set lại khi reconnect thành công
            console.log(`[SignalRService] Kết nối lại ${name} thành công với token mới`);
          } catch (err) {
            console.error(`[SignalRService] Không thể làm mới token cho ${name}:`, err.message);
            await this.stopConnections();
          }
        } else {
          // Sửa: Thử reconnect tự động cho lỗi không phải 401
          console.warn(`[SignalRService] Thử kết nối lại ${name} sau 5s...`);
          setTimeout(async () => {
            try {
              await connection.start();
              this.isConnected = true;
              console.log(`[SignalRService] Kết nối lại ${name} thành công`);
            } catch (err) {
              console.error(`[SignalRService] Không thể kết nối lại ${name}:`, err.message);
            }
          }, 5000);
        }
      });
    });
  }

  // startConnections: Sửa để nhận userId và xử lý hàng đợi
  async startConnections(token, userId) {
    if (!token || !userId) {
      throw new Error("[SignalRService] Thiếu token hoặc userId");
    }
  
    // Sửa: Khởi tạo lại connections nếu cần
    if (!this.notificationConnection || !this.chatConnection || !this.isInitialized) {
      console.log("[SignalRService] Khởi tạo lại connections");
      this.isInitialized = false;
      this.initializeConnections(token);
    }
  
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        console.log(`[SignalRService] Thử kết nối SignalR lần ${retries + 1}`);
        if (!this.notificationConnection || !this.chatConnection) {
          throw new Error("[SignalRService] Kết nối SignalR không được khởi tạo");
        }
  
        // Sửa: Kiểm tra trạng thái trước khi start
        const notificationState = this.notificationConnection.state;
        const chatState = this.chatConnection.state;
        console.log("[SignalRService] Trạng thái trước khi start:", {
          notification: notificationState,
          chat: chatState,
        });
  
        const startPromises = [];
        if (notificationState !== "Connected") {
          startPromises.push(
            this.notificationConnection.start().then(() => {
              console.log("[SignalRService] NotificationHub kết nối thành công");
            })
          );
        }
        if (chatState !== "Connected") {
          startPromises.push(
            this.chatConnection.start().then(() => {
              console.log("[SignalRService] ChatHub kết nối thành công");
            })
          );
        }
  
        if (startPromises.length > 0) {
          await Promise.all(startPromises);
        } else {
          console.log("[SignalRService] Cả hai kết nối đã ở trạng thái Connected");
        }
  
        this.isConnected = true;
        console.log("[SignalRService] Kết nối SignalR thành công");
        this.startKeepAlive();
  
        // Đăng ký lại sự kiện từ queue
        this.eventQueue.notificationHub.forEach(({ event, callback }) => {
          this.notificationConnection.on(event, callback);
          this.eventListeners.set(`notification:${event}`, callback);
          console.log(`[SignalRService] Đã đăng ký sự kiện notification: ${event}`);
        });
        this.eventQueue.chatHub.forEach(({ event, callback }) => {
          this.chatConnection.on(event, callback);
          this.eventListeners.set(`chat:${event}`, callback);
          console.log(`[SignalRService] Đã đăng ký sự kiện chat: ${event}`);
        });
        this.eventQueue = { chatHub: [], notificationHub: [] };
  
        return;
      } catch (err) {
        retries++;
        console.error(`[SignalRService] Lỗi kết nối SignalR (lần ${retries}):`, {
          message: err.message,
          stack: err.stack,
          notificationConnection: !!this.notificationConnection,
          chatConnection: !!this.chatConnection,
        });
  
        // Sửa: Xử lý lỗi 401 riêng
        if (err.message.includes("401")) {
          console.warn("[SignalRService] Token hết hạn, làm mới token...");
          try {
            const newToken = await refreshAccessToken();
            this.updateToken(newToken);
            this.initializeConnections(newToken); // Khởi tạo lại với token mới
          } catch (tokenErr) {
            console.error("[SignalRService] Không thể làm mới token:", tokenErr.message);
            throw new Error("Không thể làm mới token");
          }
        }
  
        if (retries === this.maxRetries) {
          console.error("[SignalRService] Không thể kết nối SignalR sau nhiều lần thử");
          this.isConnected = false;
          // Sửa: Không set null, để retry lần sau
          throw new Error("Không thể kết nối SignalR sau nhiều lần thử");
        }
  
        await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
      }
    }
  }

  startKeepAlive() {
    if (this.keepAliveInterval) {
      return;
    }

    this.keepAliveInterval = setInterval(async () => {
      if (this.chatConnection?.state === signalR.HubConnectionState.Connected) {
        try {
          await this.chatConnection.invoke("KeepAlive");
          console.log("Gửi KeepAlive thành công");
        } catch (err) {
          console.error("Lỗi khi gửi KeepAlive:", err.message);
        }
      }
    }, 120000);
  }

  async stopConnections() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    this.cleanupEvents();

    try {
      await Promise.all([
        this.notificationConnection?.state === signalR.HubConnectionState.Connected
          ? this.notificationConnection.stop().then(() => {
              console.log("[SignalRService] NotificationHub đã ngắt kết nối");
            })
          : Promise.resolve(),
        this.chatConnection?.state === signalR.HubConnectionState.Connected
          ? this.chatConnection.stop().then(() => {
              console.log("[SignalRService] ChatHub đã ngắt kết nối");
            })
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.error("[SignalRService] Lỗi ngắt kết nối:", err.message);
    }

    this.notificationConnection = null;
    this.chatConnection = null;
    this.isInitialized = false;
    console.log("[SignalRService] Ngắt kết nối SignalR hoàn tất");
  }

  // Cleanup tất cả sự kiện
  cleanupEvents() {
    if (this.notificationConnection) {
      this.eventListeners.forEach((callback, key) => {
        if (key.startsWith("notification:")) {
          this.notificationConnection.off(key.replace("notification:", ""));
          console.log(`[SignalRService] Hủy sự kiện ${key}`);
        }
      });
    }
    if (this.chatConnection) {
      this.eventListeners.forEach((callback, key) => {
        if (key.startsWith("chat:")) {
          this.chatConnection.off(key.replace("chat:", ""));
          console.log(`[SignalRService] Hủy sự kiện ${key}`);
        }
      });
    }
    this.eventListeners.clear();
  }

  // on: Sửa để thêm vào hàng đợi nếu chưa kết nối
  on(connection, eventName, callback) {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(`[SignalRService] Không thể đăng ký sự kiện ${eventName}: Kết nối chưa sẵn sàng, xếp hàng`);
      const queue = connection === this.notificationConnection ? this.eventQueue.notificationHub : this.eventQueue.chatHub;
      queue.push({ event: eventName, callback });
      return;
    }
    connection.on(eventName, callback);
    const key = connection === this.notificationConnection ? `notification:${eventName}` : `chat:${eventName}`;
    this.eventListeners.set(key, callback);
    console.log(`[SignalRService] Đăng ký sự kiện ${key}`);
  }

  // off: Sửa để xóa cả từ hàng đợi
  off(eventName, connection) {
    const key = connection === this.notificationConnection ? `notification:${eventName}` : `chat:${eventName}`;
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection.off(eventName);
      console.log(`[SignalRService] Hủy đăng ký sự kiện ${key}`);
      this.eventListeners.delete(key);
    }
    const queue = connection === this.notificationConnection ? this.eventQueue.notificationHub : this.eventQueue.chatHub;
    queue.splice(queue.findIndex((e) => e.event === eventName), 1);
  }


  async invoke(connection, methodName, ...args) {
    if (!connection) {
      throw new Error(`[SignalRService] Không thể gọi ${methodName}: Kết nối chưa được khởi tạo`);
    }
    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(`[SignalRService] Kết nối ${methodName} chưa sẵn sàng, trạng thái: ${connection.state}`);
      throw new Error(`Không thể gọi ${methodName}: Kết nối chưa sẵn sàng`);
    }
    try {
      await connection.invoke(methodName, ...args);
      console.log(`[SignalRService] Gọi ${methodName} thành công với args:`, args);
    } catch (err) {
      console.error(`[SignalRService] Lỗi khi gọi ${methodName}:`, err.message);
      throw err;
    }
  }

 
  
  async sendNotification(message) {
    await this.invoke(this.notificationConnection, "SendNotification", message);
  }
  // MarkMessagesAsSeen: Sửa tên và dùng invoke
  async markMessagesAsSeen(messageId,status) {
    if (!messageId) {
      console.error("markMessagesAsSeen: messageId là bắt buộc");
      throw new Error("conversationId là bắt buộc");
    }
    await this.invoke(this.chatConnection, "MarkMessagesAsSeen", messageId.toString(),status);
  }

  async joinConversation(conversationId) {
    await this.invoke(this.chatConnection, "JoinConversation", conversationId);
  }
  // leaveConversation: Sửa để dùng invoke
  async leaveConversation(conversationId) {
    await this.invoke(this.chatConnection, "LeaveConversation", conversationId);
  }
  async sendMessageToConversation(conversationId, message) {
    await this.invoke(this.chatConnection, "SendMessageToConversation", conversationId, message);
  }

  async sendTyping(conversationId,friendId) {
    await this.invoke(this.chatConnection, "SendTyping", conversationId,friendId);
  }

 // onReceiveMessage: Sửa để dùng on
 onReceiveMessage(callback) {
  this.on(this.chatConnection, "ReceiveMessage", (message) => {
    console.log("Nhận sự kiện ReceiveMessage:", message);
    callback(message);
  });
  console.log("Đăng ký sự kiện ReceiveMessage");
}
  // onReceiveUnreadCount: Sửa để dùng on
  onReceiveUnreadCount(callback) {
    this.on(this.notificationConnection, "ReceiveUnreadCountNotification", (unreadCount) => {
      console.log("Nhận sự kiện ReceiveUnreadCountNotification:", unreadCount);
      callback(unreadCount);
    });
    console.log("Đăng ký sự kiện ReceiveUnreadCountNotification");
  }
   // onReceiveMessageNotification: Sửa để dùng on
   onReceiveMessageNotification(callback) {
    this.on(this.notificationConnection,"ReceiveMessageNotification",(notifiTab)=>{
      callback(notifiTab);
    })
  }
  // onInitialOnlineUsers: Sửa để dùng on 
  onInitialOnlineUsers(callback) {
    this.on(this.chatConnection, "InitialOnlineUsers", (onlineUsers) => {
      console.log("Nhận sự kiện InitialOnlineUsers:", onlineUsers);
      callback(onlineUsers);
    });
    console.log("Đăng ký sự kiện InitialOnlineUsers");
  }

  // onUserOnline: Sửa để dùng on
  onUserOnline(callback) {
    this.on(this.chatConnection, "UserOnline", (userId) => {
      console.log("Nhận sự kiện UserOnline:", userId);
      callback(userId);
    });
    console.log("Đăng ký sự kiện UserOnline");
  }

  // onUserOffline: Sửa để dùng on
  onUserOffline(callback) {
    this.on(this.chatConnection, "UserOffline", (userId) => {
      console.log("Nhận sự kiện UserOffline:", userId);
      callback(userId);
    });
    console.log("Đăng ký sự kiện UserOffline");
  }
  // onUserTyping: Sửa để dùng on và loại bỏ fix case
  onUserTyping(callback) {
    this.on(this.chatConnection, "UserTyping", (userId) => {
      console.log(`Nhận sự kiện UserTyping từ user ${userId}`);
      if (typeof callback === "function") {
        callback(userId);
      }
    });
    console.log("Đã đăng ký sự kiện UserTyping");
  }
  onMarkAsSeen(callback){
    this.on(this.chatConnection,"MarkMessagesAsSeen",({ lastSeenMessageId, seenAt,status })=>{
      callback({ lastSeenMessageId, seenAt,status });
    })
  }

}

const signalRService = new SignalRService();
export default signalRService;
