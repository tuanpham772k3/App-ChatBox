import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "@/services/userApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Lấy thông tin user
export const getMyProfile = createAsyncThunk(
  "user/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getMyProfile();
      return res.data; // user
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Cập nhật hồ sơ
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
    profile: null,
    selectedUser: null,

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
      /* ----- getMyProfile ----- */
      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----- updateMyProfile ----- */
      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
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
