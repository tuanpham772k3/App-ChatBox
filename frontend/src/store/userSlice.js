import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "@/services/userApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Lấy người dùng đang đăng nhập
export const getMe = createAsyncThunk(
  "user/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getMe();
      return res.data; // user
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Cập nhật hồ sơ người dùng đang đăng nhập
export const updateMyProfile = createAsyncThunk(
  "user/updateMyProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userApi.updateMyProfile(payload);
      return res.data; // user
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
      return res.data; // users
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Lấy chi tiết người dùng
export const getUserDetail = createAsyncThunk(
  "user/getUserDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userApi.getUserDetail(id);
      return res.data;
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
    currentUser: null,
    selectedUser: null,

    loading: false,
    error: null,
  },
  reducers: {
    clearUserProfile: (state) => {
      state.currentUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ----- getMyProfile ----- */
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----- updateMyProfile ----- */
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----- getUserDetail ----- */
      .addCase(getUserDetail.pending, (state, action) => {
        state.loading = true;
        state.selectedUser = null;
      })
      .addCase(getUserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
