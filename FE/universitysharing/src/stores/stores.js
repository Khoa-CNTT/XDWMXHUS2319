import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // dùng localStorage
import { combineReducers } from "redux";

import listPostReducer from "./reducers/listPostReducers.js";
import listUser from "./reducers/proFileReducers.js";
import ridePostReducer from "./reducers/ridePostReducer.js";
import reportSlice from "./reducers/reportReducers.js";

import reporAdmintSlice from "./reducers/adminReducer.js";

import notificationReducer from "./reducers/notificationReducer.js";
import friendReducer from "./reducers/friendReducer.js";
import onlineUsersReducer from "./reducers/onlineSlice.js";
import searchSlice from "./reducers/searchReducers.js";
import chatAIReducer from "./reducers/chatAIReducer.js";

import deepLinkReducer from "./reducers/deepLinkReducer.js";

// 1. Tạo persist config riêng cho posts
const postsPersistConfig = {
  key: "posts",
  storage,
  whitelist: ["selectedPost"], // ❗ chỉ lưu selectedPost
};

// 2. Combine reducer lại
const rootReducer = combineReducers({
  posts: persistReducer(postsPersistConfig, listPostReducer), // dùng persist ở đây
  users: listUser,
  rides: ridePostReducer,
  report: reportSlice,
  friends: friendReducer,
  reportAdmintSlice: reporAdmintSlice,
  onlineUsers: onlineUsersReducer,
  notifications: notificationReducer,
  searchs: searchSlice,
  chatAI: chatAIReducer,
  deeplink: deepLinkReducer,

});

// 3. Tạo store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // bắt buộc khi dùng redux-persist
    }),
});

// 4. Tạo persistor
export const persistor = persistStore(store);

export default store;
