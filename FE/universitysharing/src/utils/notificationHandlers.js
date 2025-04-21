// src/utils/notificationHandlers.js
import { NOTIFICATION_TYPES } from "../constants/notificationTypes";
import avatarWeb from "../assets/AvatarDefault.png";

export const notificationHandlers = {
  ReceiveFriendNotification: {
    type: NOTIFICATION_TYPES.SEND_FRIEND,
    hasActions: true,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      ); // Log để kiểm tra
      return {
        id: notificationData.notificationId || `friend-request-${Date.now()}`, // Sửa key
        title:
          notificationData.message || "Ai đó đã gửi lời mời kết bạn cho bạn", // Sửa key
        senderId: notificationData.senderId, // Sửa key
        senderProfilePicture: notificationData.avatar || avatarWeb, // Sửa key
        createdAt: notificationData.createdAt || new Date().toISOString(), // Sửa key
        isRead: false,
        type: NOTIFICATION_TYPES.SEND_FRIEND,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0, // Sửa key
        url:
          notificationData.url ||
          (notificationData.senderId
            ? `/profile/${notificationData.senderId}`
            : "/profile"), // Sửa key
        isRealTime: true,
      };
    },
  },
  ReceiveFriendAnswerNotification: {
    type: NOTIFICATION_TYPES.ACCEPT_FRIEND,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      ); // Log để kiểm tra
      return {
        id: notificationData.notificationId || `friend-answer-${Date.now()}`, // Sửa key
        title: notificationData.message || "Ai đó đã đồng ý kết bạn với bạn", // Sửa key
        senderId: notificationData.senderId, // Sửa key
        senderProfilePicture: notificationData.avatar || avatarWeb, // Sửa key
        createdAt: notificationData.createdAt || new Date().toISOString(), // Sửa key
        isRead: false,
        type: NOTIFICATION_TYPES.ACCEPT_FRIEND,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0, // Sửa key
        url:
          notificationData.url ||
          (notificationData.senderId
            ? `/profile/${notificationData.senderId}`
            : "/profile"), // Sửa key
        isRealTime: true,
      };
    },
  },
  ReceiveSharePostNotification: {
    type: NOTIFICATION_TYPES.SHARE_POST,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      ); // Log để kiểm tra
      return {
        id: notificationData.notificationId || `friend-answer-${Date.now()}`,
        title: notificationData.message || "Ai đó đã chia sẻ bài viết của bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.SHARE_POST,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0,
        url:
          notificationData.url ||
          (notificationData.senderId
            ? `/profile/${notificationData.senderId}`
            : "/profile"), // Sửa key
        isRealTime: true,
      };
    },
  },
  ReceiveCommentNotification: {
    type: NOTIFICATION_TYPES.COMMENT_POST,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      );
      // Tạo ID duy nhất bằng cách kết hợp notificationId và timestamp
      const uniqueId = notificationData.notificationId
        ? `${notificationData.notificationId}-${Date.now()}`
        : `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: uniqueId,
        title:
          notificationData.message || "Ai đó đã bình luận bài viết của bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.COMMENT_POST,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0,
        url:
          notificationData.url ||
          (notificationData.postId
            ? `/post/${notificationData.postId}`
            : "/profile"),
        isRealTime: true,
      };
    },
  },
};
