// src/stores/reducers/notificationReducer.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchNotificationsUnread,
  fetchNotificationsRead,
  markNotificationAsRead,
} from "../action/notificationAction";

const initialState = {
  notifications: [],
  unreadNotifications: [],
  readNotifications: [],
  nextCursor: null,
  loading: false,
  error: null,
  hasMore: true,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addRealTimeNotification: (state, action) => {
      const newNotification = action.payload;
      console.log(
        "[Reducer] Received addRealTimeNotification with payload:",
        newNotification
      );

      if (!newNotification.id) {
        console.warn("[Reducer] Notification missing ID:", newNotification);
        return;
      }

      const isDuplicate = state.notifications.some(
        (n) => n.id === newNotification.id
      );

      if (!isDuplicate) {
        console.log("[Reducer] Adding notification to state");
        state.notifications = [newNotification, ...state.notifications];
        if (!newNotification.isRead) {
          state.unreadNotifications = [
            newNotification,
            ...state.unreadNotifications,
          ];
        }
        console.log("[Reducer] Updated state:", {
          notifications: state.notifications.length,
          unreadNotifications: state.unreadNotifications.length,
        });
      } else {
        console.warn(
          "[Reducer] Duplicate notification ignored:",
          newNotification
        );
      }
    },
    markRealTimeAsRead: (state, action) => {
      const notificationId = action.payload;
      console.log("[Reducer] Marking notification as read:", notificationId);

      state.notifications = state.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      );

      state.unreadNotifications = state.unreadNotifications.filter(
        (notif) => notif.id !== notificationId
      );

      if (
        !state.readNotifications.some((notif) => notif.id === notificationId)
      ) {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification) {
          state.readNotifications = [notification, ...state.readNotifications];
        }
      }
    },
    clearNotifications: (state) => {
      console.log("[Reducer] Clearing all notifications");
      state.notifications = [];
      state.unreadNotifications = [];
      state.readNotifications = [];
      state.nextCursor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const newNotifications = (action.payload.notifications || []).filter(
          (newNotif) =>
            !state.notifications.some((existing) => existing.id === newNotif.id)
        );
        state.notifications = [...state.notifications, ...newNotifications];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
        console.log(
          "[Reducer] Fetched notifications:",
          newNotifications.length
        );
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("[Reducer] Fetch notifications failed:", action.payload);
      })
      .addCase(fetchNotificationsUnread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsUnread.fulfilled, (state, action) => {
        state.loading = false;
        const newUnreadNotifications = (
          action.payload.notifications || []
        ).filter(
          (newNotif) =>
            !state.unreadNotifications.some(
              (existing) => existing.id === newNotif.id
            )
        );
        state.unreadNotifications = [
          ...state.unreadNotifications,
          ...newUnreadNotifications,
        ];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
        console.log(
          "[Reducer] Fetched unread notifications:",
          newUnreadNotifications.length
        );
      })
      .addCase(fetchNotificationsUnread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error(
          "[Reducer] Fetch unread notifications failed:",
          action.payload
        );
      })
      .addCase(fetchNotificationsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsRead.fulfilled, (state, action) => {
        state.loading = false;
        const newReadNotifications = (
          action.payload.notifications || []
        ).filter(
          (newNotif) =>
            !state.readNotifications.some(
              (existing) => existing.id === newNotif.id
            )
        );
        state.readNotifications = [
          ...state.readNotifications,
          ...newReadNotifications,
        ];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
        console.log(
          "[Reducer] Fetched read notifications:",
          newReadNotifications.length
        );
      })
      .addCase(fetchNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error(
          "[Reducer] Fetch read notifications failed:",
          action.payload
        );
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const notificationId = action.payload;
        state.notifications = state.notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
        state.unreadNotifications = state.unreadNotifications.filter(
          (notif) => notif.id !== notificationId
        );
        if (
          !state.readNotifications.some((notif) => notif.id === notificationId)
        ) {
          const notification = state.notifications.find(
            (notif) => notif.id === notificationId
          );
          if (notification) {
            state.readNotifications = [
              notification,
              ...state.readNotifications,
            ];
          }
        }
        console.log("[Reducer] Marked notification as read:", notificationId);
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error(
          "[Reducer] Mark notification as read failed:",
          action.payload
        );
      })
      .addMatcher(
        (action) => typeof action.type === "string",
        (state, action) => {
          console.log(
            "[Reducer] Received action:",
            action.type,
            action.payload
          );
        }
      );
  },
});

export const {
  addRealTimeNotification,
  markRealTimeAsRead,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
