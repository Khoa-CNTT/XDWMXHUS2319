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
      );
      return {
        id: notificationData.notificationId || `friend-request-${Date.now()}`,
        title:
          notificationData.message || "Ai đó đã gửi lời mời kết bạn cho bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.SEND_FRIEND,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0,
        url:
          notificationData.url ||
          (notificationData.senderId
            ? `/profile/${notificationData.senderId}`
            : "/profile"),
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
      );
      return {
        id: notificationData.notificationId || `friend-answer-${Date.now()}`,
        title: notificationData.message || "Ai đó đã đồng ý kết bạn với bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.ACCEPT_FRIEND,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0,
        url:
          notificationData.url ||
          (notificationData.senderId
            ? `/profile/${notificationData.senderId}`
            : "/profile"),
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
      );
      return {
        id: notificationData.notificationId || `share-post-${Date.now()}`,
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
            : "/profile"),
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
      return {
        id: notificationData.notificationId || `comment-${Date.now()}`,
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
  ReceiveLikeNotification: {
    type: NOTIFICATION_TYPES.LIKE_POST,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      );
      return {
        id: notificationData.notificationId || `like-${Date.now()}`,
        title: notificationData.message || "Ai đó đã thích bài đăng của bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.LIKE_POST,
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
  ReceiveReplyCommentNotification: {
    type: NOTIFICATION_TYPES.REPLY_COMMENT,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      );
      return {
        id: notificationData.notificationId || `like-${Date.now()}`,
        title:
          notificationData.message || "Ai đó đã phản hồi bình luận của bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.REPLY_COMMENT,
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

  ReceiveLikeCommentNotification: {
    type: NOTIFICATION_TYPES.LIKE_COMMENT,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      );
      return {
        id: notificationData.notificationId || `like-${Date.now()}`,
        title: notificationData.message || "Ai đó đã thích bình luận của bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.LIKE_COMMENT,
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
  ReceiveAcceptRide: {
    type: NOTIFICATION_TYPES.ACCEPT_RIDE,
    hasActions: false,
    mapToNotification: (notificationData) => {
      console.log(
        "[notificationHandlers] Dữ liệu nhận được:",
        notificationData
      );
      return {
        id: notificationData.notificationId || `like-${Date.now()}`,
        title:
          notificationData.message || "Ai đó đã chấp nhận chuyến đi với bạn",
        senderId: notificationData.senderId,
        senderProfilePicture: notificationData.avatar || avatarWeb,
        createdAt: notificationData.createdAt || new Date().toISOString(),
        isRead: false,
        type: NOTIFICATION_TYPES.ACCEPT_RIDE,
        mutualFriendsCount: notificationData.mutualFriendsCount || 0,
        url:
          notificationData.url ||
          (notificationData.url ? `/your-ride` : "/your-ride"),
        isRealTime: true,
      };
    },
  },
  ReceiveAlert: {
    type: NOTIFICATION_TYPES.ALERT,
    hasActions: false,
    mapToNotification: (message) => {
      console.log(
        "[notificationHandlers] Dữ liệu cảnh báo nhận được:",
        message
      );
      return {
        id: `alert-${Date.now()}`,
        title: message || "Thông báo cảnh báo từ hệ thống",
        senderId: null, //
        senderProfilePicture: avatarWeb,
        createdAt: new Date().toISOString(),
        isRead: false, // Mặc định chưa đọc
        type: NOTIFICATION_TYPES.ALERT,
        url: "/your-ride",
        isRealTime: true,
      };
    },
  },
};
