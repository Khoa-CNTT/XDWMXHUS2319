import { configureStore } from "@reduxjs/toolkit";
import listPostReducer from "./reducers/listPostReducers.js";
import listUser from "./reducers/proFileReducers.js";

const store = configureStore({
  reducer: {
    posts: listPostReducer,
    users: listUser,
  },
});

export default store;
