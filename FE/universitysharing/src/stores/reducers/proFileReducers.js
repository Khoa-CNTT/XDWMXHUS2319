import { createSlice } from "@reduxjs/toolkit";
import { userProfile } from "../action/profileActions";

const listUser = createSlice({
  name: "users",
  initialState: {
    users: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Gán dữ liệu API trả về vào users
      })
      .addCase(userProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export default listUser.reducer;
