import { configureStore } from "@reduxjs/toolkit";
import listPostReducer from "./reducers/listPostReducers.js";

const store = configureStore({
  reducer: {
    posts: listPostReducer,
  },
});

export default store;
