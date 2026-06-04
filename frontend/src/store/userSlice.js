import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "@/services/userApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Lấy thông tin user
export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getUserProfile();
      return res; // user
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Cập nhật hồ sơ
export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userApi.updateUserProfile(payload);
      return res; // user
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Tìm kiếm hoặc gợi ý người dùng
export const getUsers = createAsyncThunk(
  "user/getUsers",
  async (keyword = "", { rejectWithValue }) => {
    try {
      const res = await userApi.getUsers(keyword);
      return res; // users
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/* =============================
 *  Slice setup
 * ============================= */

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
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
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
