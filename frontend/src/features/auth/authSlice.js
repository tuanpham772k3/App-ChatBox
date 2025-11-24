import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "./services/authApi";

// Register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      return res;
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

// Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      return res;
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

//logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.logout();
      return res;
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

// Tạo slice
const authSlice = createSlice({
  name: "auth",
  // state manage
  initialState: {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      //register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = authSlice.actions;
export default authSlice.reducer;
