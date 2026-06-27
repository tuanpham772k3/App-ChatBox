import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../services/authApi";

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
    accessToken: null,
    isInitializing: true,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload || null;
    },
    clearState: (state, action) => {
      state.accessToken = null;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })

      // logout
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.accessToken = null;
      });
  },
});

export const { setAccessToken, clearState, setInitializing } = authSlice.actions;
export default authSlice.reducer;
