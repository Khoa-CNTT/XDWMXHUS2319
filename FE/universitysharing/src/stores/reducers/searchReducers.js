import { createSlice } from "@reduxjs/toolkit";
import { searchPost } from "../action/searchAction";

const searchSlice = createSlice({
  name: "searchs",
  initialState: {
    search: null,
    loading: false,
    error: null,
    lastSearchQuery: "",
  },
  reducers: {
    clearSearchResults: (state) => {
      state.search = null;
      state.error = null;
      state.lastSearchQuery = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPost.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastSearchQuery = action.meta.arg; // Store the current search query
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
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
