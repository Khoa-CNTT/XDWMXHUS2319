import {
  configureStore,
  createAction,
  combineReducers,
} from "@reduxjs/toolkit";
import listPostReducer from "./reducers/listPostReducers.js";
import listUser from "./reducers/proFileReducers.js";
import ridePostReducer from "./reducers/ridePostReducer.js";

import searchSlice from "./reducers/searchReducers.js";

const store = configureStore({
  reducer: {
    posts: listPostReducer,
    users: listUser,
    rides: ridePostReducer,

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
