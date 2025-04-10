import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
  }

  async startConnection(token) {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7053/chatHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    await this.connection.start();
    console.log("Kết nối SignalR thành công");
  }

  async joinConversation(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("JoinConversation", conversationId);
    }
  }

  async leaveConversation(conversationId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("LeaveConversation", conversationId);
    }
  }

  async sendMessage(conversationId, message) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("SendMessageToConversation", conversationId, message);
    }
  }

  async markMessageAsSeen(conversationId, messageId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke("MarkMessageAsSeen", conversationId, messageId);
    }
  }

  onReceiveMessage(callback) {
    if (this.connection) this.connection.on("ReceiveMessage", callback);
  }

  onMessageDelivered(callback) {
    if (this.connection) this.connection.on("MessageDelivered", callback);
  }

  onMessageSeen(callback) {
    if (this.connection) this.connection.on("MessageSeen", callback);
  }
}

export default new SignalRService();