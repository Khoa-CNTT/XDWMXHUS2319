import { createSlice } from "@reduxjs/toolkit";
import { searchPost } from "../action/searchAction";

const searchSlice = createSlice({
  name: "searchs",
  initialState: {
    search: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPost.fulfilled, (state, action) => {
        state.search = action.payload;
        state.loading = false;
      });
  },
});
// export const { searchPost } = search.actions;
export default searchSlice.reducer;
