import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "./services/userApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Lấy thông tin user
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getProfile();
      return res.user;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

// Cập nhật hồ sơ
export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userApi.updateProfile(payload);
      return res.user;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

// Tìm kiếm hoặc gợi ý người dùng
export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (keyword = "", { rejectWithValue }) => {
    try {
      const res = await userApi.searchUsersApi(keyword);
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

/* =============================
 *  Slice setup
 * ============================= */

const userSlice = createSlice({
  name: "user",
  // state manage
  initialState: {
    profile: null,
    searchResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      state.searchResults = [];
      state.error = null;
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* ----- fetchProfile ----- */
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /* ----- editProfile ----- */
      .addCase(editProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /* ----- searchUsers ----- */
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearUser, clearSearchResults } = userSlice.actions;
export default userSlice.reducer;
