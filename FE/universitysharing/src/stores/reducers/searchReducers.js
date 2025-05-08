import { createSlice } from "@reduxjs/toolkit";
import { searchPost, fetchUserProfile } from "../action/searchAction";

const searchSlice = createSlice({
  name: "searchs",
  initialState: {
    search: null,
    userProfile: null,
    loading: false,
    profileLoading: false,
    error: null,
    profileError: null,
    lastSearchQuery: "",
  },
  reducers: {
    clearSearchResults: (state) => {
      state.search = null;
      state.error = null;
      state.lastSearchQuery = "";
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
      state.profileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search post
      .addCase(searchPost.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastSearchQuery = action.meta.arg;
      })
      .addCase(searchPost.fulfilled, (state, action) => {
        state.search = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.search = null;
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
        state.profileLoading = false;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
        state.userProfile = null;
      });
  },
});

export const { clearSearchResults, clearUserProfile } = searchSlice.actions;
export default searchSlice.reducer;
