// import * as signalR from "@microsoft/signalr";

// class SignalRService {
//   constructor() {
//     this.connection = null;
//   }

//   async startConnection(token, userId) {
//     if (this.connection?.state === signalR.HubConnectionState.Connected) {
//       console.log("Kết nối đã tồn tại, bỏ qua khởi tạo mới");
//       return;
//     }

//     console.log("Khởi tạo SignalR HubConnection với URL: https://localhost:7053/notificationHub");
//     this.connection = new signalR.HubConnectionBuilder()
//       .withUrl("https://localhost:7053/notificationHub", {
//         accessTokenFactory: () => {
//           console.log("Gửi token:", token);
//           return token;
//         },
//       })
//       .withAutomaticReconnect()
//       .configureLogging(signalR.LogLevel.Information) // Log chi tiết từ SignalR
//       .build();

//     this.connection.on("ReceiveUserId", () => {
//       console.log("Server yêu cầu UserId, gửi:", userId);
//       this.connection.invoke("SetUserId", userId).catch(err => console.error("Lỗi gửi UserId:", err));
//     });

//     this.connection.onreconnecting((error) => console.log("SignalR đang reconnect:", error));
//     this.connection.onreconnected((connectionId) => console.log("SignalR reconnected:", connectionId));
//     this.connection.onclose((error) => console.log("SignalR đóng:", error));

//     try {
//       console.log("Bắt đầu kết nối tới server...");
//       await this.connection.start();
//       console.log("Kết nối SignalR thành công với token:", token, "và UserId:", userId);
//       // Gọi SetUserId thủ công sau khi kết nối
//       console.log("Gửi UserId thủ công:", userId);
//       await this.connection.invoke("SetUserId", userId);
//     } catch (err) {
//       console.error("Lỗi khi bắt đầu kết nối SignalR:", err.message, err.stack);
//       throw err;
//     }
//   }

//   async stopConnection() {
//     if (this.connection) {
//       console.log("Dừng kết nối SignalR...");
//       await this.connection.stop();
//       this.connection = null;
//       console.log("Đã dừng kết nối SignalR");
//     }
//   }

//   on(eventName, callback) {
//     if (this.connection) {
//       console.log(`Đăng ký sự kiện: ${eventName}`);
//       this.connection.on(eventName, callback);
//     } else {
//       console.warn(`Không thể đăng ký sự kiện ${eventName}, connection chưa được khởi tạo`);
//     }
//   }

//   off(eventName, callback) {
//     if (this.connection) {
//       this.connection.off(eventName, callback);
//     }
//   }

//   onReceiveMessageNotification(callback) {
//     console.log("Đăng ký sự kiện ReceiveMessageNotification");
//     this.on("ReceiveMessageNotification", callback);
//   }
// }

// export default new SignalRService();