import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../services/authApi";

const savedToken = localStorage.getItem("accessToken");
const savedUser = JSON.parse(localStorage.getItem("user"));

// Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      return res.data; // { accessToken, user }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

//logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.logout();
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser,
    accessToken: savedToken,
  },
  reducers: {
    syncAccessToken: (state, action) => {
      state.accessToken = action.payload || null;

      if (action.payload) {
        localStorage.setItem("accessToken", action.payload);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      });
  },
});

export const { syncAccessToken } = authSlice.actions;
export default authSlice.reducer;
