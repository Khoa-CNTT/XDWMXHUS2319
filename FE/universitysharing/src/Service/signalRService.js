// src/services/signalService.js
import * as signalR from "@microsoft/signalr";
import { refreshAccessToken } from "./authService";
class SignalRService {
  constructor() {
    if (SignalRService.instance) {
      return SignalRService.instance;
    }

    this.notificationConnection = null;
    this.chatConnection = null;
    this.aiConnection = null;
    this.isInitialized = false; // Xóa trùng lặp
    this.keepAliveInterval = null;
    this.maxRetries = 5;
    this.retryInterval = 5000;
    this.baseUrl = process.env.REACT_APP_BASE_URL;
    this.eventListeners = new Map(); // Lưu trữ sự kiện để cleanup
    this.eventQueue = { chatHub: [], notificationHub: [], aiHub: [] }; // Thêm hàng đợi sự kiện
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
      if (!this.aiConnection) {
        this.aiConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${this.baseUrl}/aiHub`, {
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
      this.aiConnection = null;
      this.isInitialized = false;
      throw err;
    }
  }

  // Thêm phương thức để cập nhật token mới
  updateToken(token) {
    if (
      !this.notificationConnection ||
      !this.chatConnection ||
      !this.aiConnection
    ) {
      console.warn(
        "[SignalRService] Kết nối chưa khởi tạo, không thể cập nhật token"
      );
      return;
    }

    this.notificationConnection.accessTokenFactory = () => token;
    this.chatConnection.accessTokenFactory = () => token;
    this.aiConnection.accessTokenFactory = () => token;
    console.log("[SignalRService] Đã cập nhật token mới cho SignalR");
  }

  // Xử lý lỗi kết nối (bao gồm 401)
  setupErrorHandling() {
    const connections = [
      { name: "notification", connection: this.notificationConnection },
      { name: "chat", connection: this.chatConnection },
      { name: "ai", connection: this.aiConnection },
    ];

    connections.forEach(({ name, connection }) => {
      if (!connection) return;

      connection.onclose(async (error) => {
        console.error(
          `[SignalRService] Kết nối ${name} bị đóng:`,
          error?.message
        );
        this.isConnected = false;

        if (error?.message?.includes("401")) {
          try {
            const newToken = await refreshAccessToken();
            this.updateToken(newToken);
            await connection.start();
            this.isConnected = true;
            this.eventQueue[
              name === "notification"
                ? "notificationHub"
                : name === "chat"
                ? "chatHub"
                : "aiHub"
            ].forEach(({ event, callback }) => {
              connection.on(event, callback);
              this.eventListeners.set(`${name}:${event}`, callback);
            });
          } catch (err) {
            console.error(
              `[SignalRService] Không thể làm mới token cho ${name}:`,
              err.message
            );
            await this.stopConnections();
          }
        } else {
          setTimeout(async () => {
            try {
              await connection.start();
              this.isConnected = true;
              this.eventQueue[
                name === "notification"
                  ? "notificationHub"
                  : name === "chat"
                  ? "chatHub"
                  : "aiHub"
              ].forEach(({ event, callback }) => {
                connection.on(event, callback);
                this.eventListeners.set(`${name}:${event}`, callback);
              });
            } catch (err) {
              console.error(
                `[SignalRService] Không thể kết nối lại ${name}:`,
                err.message
              );
            }
          }, 5000);
        }
      });
    });
  }

  // startConnections: Sửa để nhận userId và xử lý hàng đợi
 async startConnections(token, userId) {
    if (!token || !userId) {
        console.error("[SignalRService] Thiếu token hoặc userId:", { token, userId });
        throw new Error("[SignalRService] Thiếu token hoặc userId");
    }

    if (
        this.isConnected &&
        this.notificationConnection?.state === "Connected" &&
        this.chatConnection?.state === "Connected" &&
        this.aiConnection?.state === "Connected"
    ) {
        console.log("[SignalRService] Kết nối đã tồn tại, bỏ qua startConnections");
        return;
    }

    if (
        !this.notificationConnection ||
        !this.chatConnection ||
        !this.aiConnection ||
        !this.isInitialized
    ) {
        console.log("[SignalRService] Khởi tạo lại connections");
        this.isInitialized = false;
        this.initializeConnections(token);
    }

    let retries = 0;
    while (retries < this.maxRetries) {
        try {
            console.log(`[SignalRService] Thử kết nối SignalR lần ${retries + 1}`);
            if (
                !this.notificationConnection ||
                !this.chatConnection ||
                !this.aiConnection
            ) {
                throw new Error("[SignalRService] Kết nối SignalR không được khởi tạo");
            }

            const startPromises = [];
            if (this.notificationConnection.state !== "Connected") {
                startPromises.push(
                    this.notificationConnection
                        .start()
                        .then(() => console.log("[SignalRService] NotificationHub kết nối thành công"))
                );
            }
            if (this.chatConnection.state !== "Connected") {
                startPromises.push(
                    this.chatConnection
                        .start()
                        .then(() => console.log("[SignalRService] ChatHub kết nối thành công"))
                );
            }
            if (this.aiConnection.state !== "Connected") {
                startPromises.push(
                    this.aiConnection
                        .start()
                        .then(() => console.log("[SignalRService] AIHub kết nối thành công"))
                );
            }

            if (startPromises.length > 0) {
                await Promise.all(startPromises);
            } else {
                console.log("[SignalRService] Tất cả kết nối đã ở trạng thái Connected");
            }

            this.isConnected = true;
            console.log("[SignalRService] Kết nối SignalR thành công");
            this.startKeepAlive();
            this.setupWindowEvents(); // Thêm sự kiện window

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
            this.eventQueue.aiHub.forEach(({ event, callback }) => {
                this.aiConnection.on(event, callback);
                this.eventListeners.set(`ai:${event}`, callback);
                console.log(`[SignalRService] Đã đăng ký sự kiện ai: ${event}`);
            });
            this.eventQueue = { chatHub: [], notificationHub: [], aiHub: [] };

            return;
        } catch (err) {
            retries++;
            console.error(`[SignalRService] Lỗi kết nối SignalR (lần ${retries}):`, {
                message: err.message,
                stack: err.stack,
                notificationConnection: !!this.notificationConnection,
                chatConnection: !!this.chatConnection,
                aiConnection: !!this.aiConnection,
            });

            if (err.message.includes("401")) {
                console.warn("[SignalRService] Token hết hạn, làm mới token...");
                try {
                    const newToken = await refreshAccessToken();
                    this.updateToken(newToken);
                    this.initializeConnections(newToken);
                } catch (tokenErr) {
                    console.error("[SignalRService] Không thể làm mới token:", tokenErr.message);
                    throw new Error("Không thể làm mới token");
                }
            }

            if (retries === this.maxRetries) {
                console.error("[SignalRService] Không thể kết nối SignalR sau nhiều lần thử");
                this.isConnected = false;
                throw new Error("Không thể kết nối SignalR sau nhiều lần thử");
            }

            await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
        }
    }
}

startKeepAlive() {
    if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
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
    }, 10000); // Giảm từ 15s xuống 10s
}
setupWindowEvents() {
    window.addEventListener("beforeunload", async (e) => {
        //e.preventDefault(); // Đảm bảo sự kiện được xử lý
        console.log("[SignalRService] Closing tab, stopping connections...");
        await this.stopConnections();
       // e.returnValue = ""; // Cho phép trình duyệt đóng tab sau khi ngắt kết nối
    });
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
                ? this.notificationConnection.stop().then(() => console.log("[SignalRService] NotificationHub đã ngắt kết nối"))
                : Promise.resolve(),
            this.chatConnection?.state === signalR.HubConnectionState.Connected
                ? this.chatConnection.stop().then(() => console.log("[SignalRService] ChatHub đã ngắt kết nối"))
                : Promise.resolve(),
            this.aiConnection?.state === signalR.HubConnectionState.Connected
                ? this.aiConnection.stop().then(() => console.log("[SignalRService] AIHub đã ngắt kết nối"))
                : Promise.resolve(),
        ]);
    } catch (err) {
        console.error("[SignalRService] Lỗi ngắt kết nối:", err.message);
    }

    this.notificationConnection = null;
    this.chatConnection = null;
    this.aiConnection = null;
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
    if (this.aiConnection) {
      this.eventListeners.forEach((callback, key) => {
        if (key.startsWith("ai:")) {
          this.aiConnection.off(key.replace("ai:", ""));
          console.log(`[SignalRService] Hủy sự kiện ${key}`);
        }
      });
    }
    this.eventListeners.clear();
  }

  // on: Sửa để thêm vào hàng đợi nếu chưa kết nối
  on(connection, eventName, callback) {
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn(
        `[SignalRService] Không thể đăng ký sự kiện ${eventName}: Kết nối chưa sẵn sàng, xếp hàng`
      );
      const queue =
        connection === this.notificationConnection
          ? this.eventQueue.notificationHub
          : connection === this.chatConnection
          ? this.eventQueue.chatHub
          : this.eventQueue.aiHub;
      queue.push({ event: eventName, callback });
      return;
    }
    connection.on(eventName, callback);
    const key =
      connection === this.notificationConnection
        ? `notification:${eventName}`
        : connection === this.chatConnection
        ? `chat:${eventName}`
        : `ai:${eventName}`;

    this.eventListeners.set(key, callback);
    console.log(`[SignalRService] Đăng ký sự kiện ${key}`);
  }

  // off: Sửa để xóa cả từ hàng đợi
  off(eventName, connection) {
    const key =
      connection === this.notificationConnection
        ? `notification:${eventName}`
        : connection === this.chatConnection
        ? `chat:${eventName}`
        : `ai:${eventName}`;
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected
    ) {
      connection.off(eventName);
      console.log(`[SignalRService] Hủy đăng ký sự kiện ${key}`);
      this.eventListeners.delete(key);
    }
    const queue =
      connection === this.notificationConnection
        ? this.eventQueue.notificationHub
        : connection === this.chatConnection
        ? this.eventQueue.chatHub
        : this.eventQueue.aiHub;
    queue.splice(
      queue.findIndex((e) => e.event === eventName),
      1
    );
  }

  async invoke(connection, methodName, ...args) {
    if (!connection) {
      throw new Error(
        `[SignalRService] Không thể gọi ${methodName}: Kết nối chưa được khởi tạo`
      );
    }
    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(
        `[SignalRService] Kết nối ${methodName} chưa sẵn sàng, trạng thái: ${connection.state}`
      );
      throw new Error(`Không thể gọi ${methodName}: Kết nối chưa sẵn sàng`);
    }
    try {
      await connection.invoke(methodName, ...args);
      console.log(
        `[SignalRService] Gọi ${methodName} thành công với args:`,
        args
      );
    } catch (err) {
      console.error(`[SignalRService] Lỗi khi gọi ${methodName}:`, err.message);
      throw err;
    }
  }
  // Phương thức cho AIHub
  async joinConversationAI(conversationId) {
    await this.invoke(this.aiConnection, "JoinConversation", conversationId);
  }

  async leaveConversationAI(conversationId) {
    await this.invoke(this.aiConnection, "LeaveConversation", conversationId);
  }
  onReceiveAnswer(callback) {
    this.on(this.aiConnection, "ReceiveAnswer", (message) => {
      console.log("[SignalRService] Nhận sự kiện ReceiveAnswer:", message);
      callback(message.Data, message.Final);
    });
    console.log("Đăng ký sự kiện ReceiveAnswer");
  }

  async sendStreamQuery(query, currentConversationId, streamId) {
    await this.aiConnection.invoke(
      "StreamQuery",
      query,
      currentConversationId,
      streamId
    );
  }

  onReceiveChunk(callback) {
    this.on(this.aiConnection, "ReceiveChunk", (content, streamId) => {
      console.log(
        "[SignalRService] Nhận sự kiện ReceiveChunk:",
        content,
        "StreamId:",
        streamId
      );
      callback(content, streamId);
    });
    console.log("Đăng ký sự kiện ReceiveChunk");
  }
  onStreamCompleted(callback) {
    this.on(this.aiConnection, "StreamCompleted", (streamId) => {
      console.log(
        "[SignalRService] Nhận sự kiện StreamCompleted, StreamId:",
        streamId
      );
      callback(streamId);
    });
  }

  onReceiveComplete(callback) {
    this.on(this.aiConnection, "ReceiveComplete", (content, streamId) => {
      console.log(
        "[SignalRService] Nhận sự kiện ReceiveComplete:",
        content,
        "StreamId:",
        streamId
      );
      callback(content, streamId);
    });
    console.log("Đăng ký sự kiện ReceiveComplete");
  }

  async sendNotification(message) {
    await this.invoke(this.notificationConnection, "SendNotification", message);
  }
  // MarkMessagesAsSeen: Sửa tên và dùng invoke
  async markMessagesAsSeen(messageId, status) {
    if (!messageId) {
      console.error("markMessagesAsSeen: messageId là bắt buộc");
      throw new Error("conversationId là bắt buộc");
    }
    await this.invoke(
      this.chatConnection,
      "MarkMessagesAsSeen",
      messageId.toString(),
      status
    );
  }

  async joinConversation(conversationId) {
    await this.invoke(this.chatConnection, "JoinConversation", conversationId);
  }
  // leaveConversation: Sửa để dùng invoke
  async leaveConversation(conversationId) {
    await this.invoke(this.chatConnection, "LeaveConversation", conversationId);
  }
  async sendMessageToConversation(conversationId, message) {
    await this.invoke(
      this.chatConnection,
      "SendMessageToConversation",
      conversationId,
      message
    );
  }

  async sendTyping(conversationId, friendId) {
    await this.invoke(
      this.chatConnection,
      "SendTyping",
      conversationId,
      friendId
    );
  }

  // onReceiveMessage: Sửa để dùng on
  onReceiveMessage(callback) {
    this.on(this.chatConnection, "ReceiveMessage", (message) => {
      console.error("Nhận sự kiện ReceiveMessage:", message);
      callback(message);
    });
    console.log("Đăng ký sự kiện ReceiveMessage");
  }

  //Nhận data messenger không cần join
  onReceiveMessageData(callback) {
    this.on(this.chatConnection, "MessageNotifyData", (message) => {
      console.error("Nhận sự kiện ReceiveMessageData 🥰:", message);
      callback(message);
    });
    console.log("Đăng ký sự kiện ReceiveMessageData 🥰");
  }

  // onReceiveUnreadCount: Sửa để dùng on
  onReceiveUnreadCount(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveUnreadCountNotification",
      (unreadCount) => {
        console.log(
          "Nhận sự kiện ReceiveUnreadCountNotification:",
          unreadCount
        );
        callback(unreadCount);
      }
    );
    console.log("Đăng ký sự kiện ReceiveUnreadCountNotification");
  }
  // onReceiveMessageNotification: Sửa để dùng on
  onReceiveMessageNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveMessageNotification",
      (notifiTab) => {
        callback(notifiTab);
      }
    );
  }
  // onInitialOnlineUsers: Sửa để dùng on
  onInitialOnlineUsers(callback) {
    this.on(this.chatConnection, "initialOnlineUsers", (onlineUsers) => {
      console.log("Nhận sự kiện initialOnlineUsers:", onlineUsers);
      callback(onlineUsers);
    });
    console.log("Đăng ký sự kiện initialOnlineUsers");
  }

  // onUserOnline: Sửa để dùng on
  onUserOnline(callback) {
    this.on(this.chatConnection, "userOnline", (userId) => {
      console.log("Nhận sự kiện userOnline:", userId);
      callback(userId);
    });
    console.log("Đăng ký sự kiện userOnline");
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
  onMarkAsSeen(callback) {
    this.on(
      this.chatConnection,
      "MarkMessagesAsSeen",
      ({ lastSeenMessageId, seenAt, status }) => {
        callback({ lastSeenMessageId, seenAt, status });
      }
    );
  }
  onReceiveFriendNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveFriendNotification",
      (notificationData) => {
        console.log("Received friend notification:", notificationData);
        callback(notificationData);
      }
    );
  }
  // Thêm phương thức để xử lý sự kiện khi có người đồng ý kết bạn
  onReceiveFriendAnswerNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveFriendAnswerNotification",
      (notificationData) => {
        console.log("Nhận được thông báo đồng ý kết bạn:", notificationData);
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveFriendAnswerNotification");
  }
  // Thêm phương thức để xử lý sự kiện khi có chia sẻ bài viết của bạn
  onReceiveSharePostNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveSharePostNotification",
      (notificationData) => {
        console.log("Nhận được thông báo chia sẻ bài viết:", notificationData);
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveSharePostNotification");
  }
  // Thêm phương thức để xử lý sự kiện khi có bình luận vào bài viết của bạn
  onReceiveCommentNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveCommentNotification",
      (notificationData) => {
        console.log(
          "Nhận được thông báo bình luận bài viết:",
          notificationData
        );
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveCommentNotification");
  }
  // Thêm phương thức để xử lý sự kiện khi có người thích bài viết của bạn
  onReceiveLikeNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveLikeNotification",
      (notificationData) => {
        console.log("Nhận được thông báo thích bài viết:", notificationData);
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveLikeNotification");
  }

  // Thêm phương thức để xử lý sự kiện khi phản hồi bình luận
  onReceiveReplyCommentNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveReplyCommentNotification",
      (notificationData) => {
        console.log(
          "Nhận được thông báo phản hồi bình luận:",
          notificationData
        );
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveReplyCommentNotification");
  }

  // Thêm phương thức để xử lý sự kiện khi thích bình luận
  onReceiveLikeCommentNotification(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveLikeCommentNotification",
      (notificationData) => {
        console.log("Nhận được thông báo thích bình luận:", notificationData);
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveLikeCommentNotification");
  }

  // Thêm phương thức để xử lý sự kiện khi bị cảnh báo
  onReceiveAlert(callback) {
    this.on(this.notificationConnection, "ReceiveAlert", (message) => {
      console.log("Nhận được thông báo thích bình luận:", message);
      callback(message);
    });
    console.log("Đã đăng ký sự kiện ReceiveAlert");
  }

  onReceiveAcceptRide(callback) {
    this.on(
      this.notificationConnection,
      "ReceiveAcceptRide",
      (notificationData) => {
        console.log(
          "Nhận được thông báo chấp nhận chuyến đi",
          notificationData
        );
        callback(notificationData);
      }
    );
    console.log("Đã đăng ký sự kiện ReceiveAcceptRide");
  }

  // Đăng ký sự kiện nhận thông báo cập nhật vị trí
  // onReceiveLocationUpdateNotification(callback) {
  //   this.on(
  //     this.notificationConnection,
  //     "ReceiveNotificationUpdateLocation",
  //     (notificationData) => {
  //       console.log("Nhận được thông báo cập nhật vị trí:", notificationData);
  //       callback(notificationData);

  //     }
  //   );
  //   console.log("Đã đăng ký sự kiện ReceiveNotificationUpdateLocation");
  // }
}

const signalRService = new SignalRService();
export default signalRService;
