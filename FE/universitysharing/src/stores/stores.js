import { configureStore } from "@reduxjs/toolkit";
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
const store = configureStore({
  reducer: {
    posts: listPostReducer,
    users: listUser,
    rides: ridePostReducer,

    report: reportSlice,
    reportAdmintSlice: reporAdmintSlice,

    friends: friendReducer,
    onlineUsers: onlineUsersReducer,
    notifications: notificationReducer,
    searchs: searchSlice,
    chatAI: chatAIReducer,

    searchs: searchSlice,
  },
});

export default store;

// // store.js BETA
// import {
//   configureStore,
//   createAction,
//   combineReducers,
// } from "@reduxjs/toolkit";
// import listPostReducer from "./reducers/listPostReducers.js";
// import listUser from "./reducers/proFileReducers.js";
// import ridePostReducer from "./reducers/ridePostReducer.js";

// // 1. Tạo action reset toàn bộ state
// export const resetApp = createAction("RESET_APP");

// // 2. Kết hợp các reducers lại
// const appReducer = combineReducers({
//   posts: listPostReducer,
//   users: listUser,
//   rides: ridePostReducer,
// });

// // 3. Tạo rootReducer có khả năng reset state
// const rootReducer = (state, action) => {
//   // Khi dispatch action 'RESET_APP', reset toàn bộ state về initialState
//   if (action.type === resetApp.type) {
//     return appReducer(undefined, action); // Truyền `undefined` để Redux tự reset từng reducer
//   }
//   return appReducer(state, action);
// };

// // 4. Tạo store với rootReducer đã được xử lý
// const store = configureStore({
//   reducer: rootReducer,
// });

// export default store;
