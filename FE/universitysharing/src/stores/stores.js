import { configureStore } from "@reduxjs/toolkit";
import listPostReducer from "./reducers/listPostReducers.js";
import listUser from "./reducers/proFileReducers.js";
import ridePostReducer from "./reducers/ridePostReducer.js"
const store = configureStore({
  reducer: {
    posts: listPostReducer,
    users: listUser,
    rides: ridePostReducer
  },
});

export default store;
