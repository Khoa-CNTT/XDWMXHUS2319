import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchNotificationsUnread,
  fetchNotificationsRead,
  markNotificationAsRead,
  fetchUnreadNotificationCount,
} from "../action/notificationAction";

const initialState = {
  notifications: [],
  unreadNotifications: [],
  readNotifications: [],
  nextCursor: null,
  loading: false,
  error: null,
  hasMore: true,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNewNotification: (state, action) => {
      if (
        !state.notifications.some((notif) => notif.id === action.payload.id)
      ) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadNotifications.unshift(action.payload);
        }
      }
    },
    clearNewNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = [];
      state.readNotifications = [];
    },
    addRealTimeNotification(state, action) {
      const newNotification = action.payload;
      if (
        !state.notifications.some((notif) => notif.id === newNotification.id)
      ) {
        state.notifications.unshift(newNotification); // Add new notification to the start
        state.unreadCount += 1; // Increment unread count for new notification
      }
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload; // Set unread count directly
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
        state.notifications = state.notifications.length
          ? [...state.notifications, ...newNotifications]
          : action.payload.notifications || [];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.unreadNotifications = state.unreadNotifications.length
          ? [...state.unreadNotifications, ...newUnreadNotifications]
          : action.payload.notifications || [];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
      })
      .addCase(fetchNotificationsUnread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.readNotifications = state.readNotifications.length
          ? [...state.readNotifications, ...newReadNotifications]
          : action.payload.notifications || [];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = !!action.payload.nextCursor;
      })
      .addCase(fetchNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
            state.readNotifications.unshift(notification);
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadNotificationCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload; // Set the fetched unread count
      })
      .addCase(fetchUnreadNotificationCount.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch unread notification count";
      });
  },
});

export const {
  addNewNotification,
  clearNewNotifications,
  addRealTimeNotification,
  setUnreadCount,
} = notificationSlice.actions;
export default notificationSlice.reducer;
