import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  markInboxAsSeen,
} from "../stores/reducers/messengerReducer";
import { sendMessages } from "../stores/action/messageAction";
import { useSignalR } from "../Service/SignalRProvider";
import { toast } from "react-toastify";
export const useChatHandle = () => {
  const dispatch = useDispatch();
  const { signalRService, isConnected } = useSignalR();

  //Hàm join vào cuộc trò chuyện
  const handleJoin = async (conversationId) => {
    try {
      await signalRService.joinConversation(conversationId);
      //   console.error("Đã tham gia cuộc trò chuyện >>", conversationId);
    } catch (err) {
      console.error("Lỗi join:", err.message);
    }
  };

  const handleLeaveChat = async (conversationId) => {
    try {
      await signalRService.leaveConversation(conversationId);
      //   console.error("Đã rời cuộc trò chuyện >>", conversationId);
    } catch (error) {
      console.error("Lỗi leave:", error.message);
    }
  };

  //Hàm gửi tin nhắn qua API
  const handleSendMessage = async ({
    friendId,
    content,
    conversationId,
    token,
    isSending,
    setIsSending,
    setNewMessage,
    setIsUserTyping,
    // setConversationId,
  }) => {
    const contentToSend = content.trim();
    if (!contentToSend || !isConnected || isSending) {
      if (!isConnected) {
        toast.error("Không thể gửi tin nhắn: Chưa kết nối");
      }
      if (isSending) {
        console.warn("[ChatHandle] Đang gửi tin nhắn...");
      }
      return;
    }
    // console.warn("Token", token);
    const messageDto = {
      user2Id: friendId,
      content: contentToSend,
      conversationId,
    };

    setIsSending(true);

    try {
      console.log("[ChatHandle] Gửi tin nhắn qua API:", messageDto);
      const sentMessage = await dispatch(
        sendMessages({ messageDto, token }) // ✅ đúng cú pháp
      );

      // console.warn("data", sentMessage);
      if (!sentMessage) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      // Nếu mới tạo cuộc trò chuyện, cập nhật ID và join SignalR
      if (!conversationId && sentMessage.conversationId) {
        // setConversationId(sentMessage.conversationId);
        await handleJoin(sentMessage.conversationId);
      }

      setNewMessage("");
      setIsUserTyping(false);
    } catch (err) {
      console.error("[ChatHandle] Lỗi khi gửi:", err.message);
      toast.error(`Không thể gửi tin nhắn: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Đánh dấu đã đọc
  const markConversationAsSeen = async ({
    conversationId,
    friendId,
    messages,
    status,
  }) => {
    if (!conversationId) return;
    console.warn("conversationId>>", conversationId);
    console.warn("friendId>>", friendId);
    console.warn("messages>>", messages);
    console.warn("status>>", status);
    try {
      // Bước 1: Lọc ra tin nhắn mới nhất từ bạn bè
      const lastMessageFromUser = messages
        .filter((msg) => msg.senderId === friendId)
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];

      console.warn("lastMessageFromUser>>", lastMessageFromUser);

      if (lastMessageFromUser) {
        // Bước 2: Gửi trạng thái đã xem qua SignalR
        await signalRService.markMessagesAsSeen(
          lastMessageFromUser.id.toString(), // 🛠️ Đảm bảo là Guid string
          status // Sử dụng status từ tham số hàm, không phải từ tin nhắn
        );

        // Bước 3: Dispatch hàm Redux để đánh dấu đã xem
        dispatch(markInboxAsSeen({ friendId }));
      }
    } catch (error) {
      console.error("Lỗi>> ", error);
    }
  };

  return {
    handleSendMessage,
    handleJoin,
    handleLeaveChat,
    markConversationAsSeen,
  };
};

export const useMessageReceiver = () => {
  const dispatch = useDispatch();
  const { signalRService, isConnected } = useSignalR();
  const { conversationId } = useSelector((state) => state.messenges);

  useEffect(() => {
    if (!isConnected || !conversationId) return;

    const unsubscribe = signalRService.onReceiveMessage((message) => {
      if (message.conversationId.toString() !== conversationId.toString()) {
        return;
      }

      dispatch(addMessage(message));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isConnected, conversationId, dispatch]);
};

export const useMessageReceiverData = () => {
  const dispatch = useDispatch();
  const { signalRService, isConnected } = useSignalR();
  const { conversationId } = useSelector((state) => state.messenges);

  useEffect(() => {
    const unsubscribe = signalRService.onReceiveMessageData((message) => {
      console.warn("[Nhận thông báo] 🥰🥰🥰", message);

      dispatch(addMessage(message));
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isConnected, conversationId, dispatch]);
};
