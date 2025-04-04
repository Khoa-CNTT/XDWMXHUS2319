import { configureStore } from "@reduxjs/toolkit";
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
